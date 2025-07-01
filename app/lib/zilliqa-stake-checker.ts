// Конфигурация для Mainnet
const MAINNET_CONFIG = {
    api: 'https://api.zilliqa.com',
    impl: '0xa7C67D49C82c7dc1B73D231640B2e4d0661D37c1', // Mainnet staking contract
    chainId: 1
};

// Интерфейсы
export interface NodeStakeInfo {
    ssnName: string;
    ssnAddress: string;
    stakeAmount: bigint;
    rewardsAmount: bigint;
    commissionRate: bigint;
    status: string;
}

// Этот интерфейс идеально совпадает с форматом ответа для каждого элемента в batch-ответе
interface BatchQueryResult {
    id: number;
    result: any;
    jsonrpc?: string; // опционально, для полноты
}

// Интерфейс для данных, необходимых для расчета наград
interface RewardCalculationData {
    lastRewardCycle: number;
    lastWithdrawCycleMap: any;
    stakeSsnPerCycleMaps: { [ssnAddress: string]: any };
    directDepositMaps: { [ssnAddress: string]: any };
    buffDepositMaps: { [ssnAddress: string]: any };
    delegStakePerCycleMaps: { [ssnAddress: string]: any };
}

export class ZilliqaStakeChecker {
    private apiUrl: string;
    private implAddress: string;

    constructor() {
        this.apiUrl = MAINNET_CONFIG.api;
        this.implAddress = MAINNET_CONFIG.impl;
    }

    private async batchQuery(queries: Array<[string, string, any[]]>): Promise<BatchQueryResult[]> {
        if (queries.length === 0) return [];
        const startTime = performance.now();

        const requestBody = queries.map((query, index) => ({
            jsonrpc: '2.0',
            id: index + 1,
            method: 'GetSmartContractSubState',
            params: [
                query[0],
                query[1],
                query[2]
            ]
        }));

        try {
            console.log(` Выполняется batch запрос (${queries.length} запросов) через fetch (стандарт JSON-RPC 2.0)...`);
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`Сетевая ошибка: ${response.status} ${response.statusText}`);
            }

            const jsonResponse: BatchQueryResult[] | {error: any} = await response.json();
            
            if (!Array.isArray(jsonResponse)) {
                 if (jsonResponse.error) {
                    throw new Error(`Ошибка RPC: ${jsonResponse.error.message}`);
                 }
                throw new Error('Ответ от API не является массивом, как ожидалось для batch-запроса.');
            }

            const endTime = performance.now();
            console.log(`✅ Batch запрос выполнен за ${((endTime - startTime) / 1000).toFixed(2)}с`);
            
            return jsonResponse.sort((a, b) => a.id - b.id);
            
        } catch (error) {
            console.error('❌ Ошибка в batch запросе:', error);
            throw error;
        }
    }

    private normalizeAddress(address: string): string {
        if (!/^0x[0-9a-f]{40}$/i.test(address)) {
            throw new Error(`Неверный формат адреса: ${address}. Ожидается hex-адрес формата 0x...`);
        }
        return address.toLowerCase();
    }

    private async calculateRewards(normalizedAddress: string, userDeposits: { [ssn: string]: string }, rewardData: RewardCalculationData): Promise<{ [ssnAddress: string]: bigint }> {
        console.log(`
 Расчет невостребованных наград (в Qa)...`);
        const rewardsBySsn: { [ssnAddress: string]: bigint } = {};

        for (const ssnAddress of Object.keys(userDeposits)) {
            let totalSsnReward = 0n;

            try {
                const lastWithdrawCycle = parseInt(rewardData.lastWithdrawCycleMap?.last_withdraw_cycle_deleg?.[normalizedAddress]?.[ssnAddress] || '0');
                const cyclesToCalculate = [];
                for (let i = lastWithdrawCycle + 1; i <= rewardData.lastRewardCycle; i++) {
                    cyclesToCalculate.push(i);
                }

                if (cyclesToCalculate.length === 0) {
                    rewardsBySsn[ssnAddress] = 0n;
                    continue;
                }

                const delegStakePerCycleMap = new Map<number, bigint>();
                const directMap = rewardData.directDepositMaps[ssnAddress]?.direct_deposit_deleg?.[normalizedAddress]?.[ssnAddress] || {};
                const buffMap = rewardData.buffDepositMaps[ssnAddress]?.buff_deposit_deleg?.[normalizedAddress]?.[ssnAddress] || {};

                for (let cycle = 1; cycle <= rewardData.lastRewardCycle; cycle++) {
                    const c1 = cycle - 1;
                    const c2 = cycle - 2;
                    const dir_amt = BigInt(directMap[c1.toString()] || 0);
                    const buf_amt = BigInt(buffMap[c2.toString()] || 0);
                    const last_amt = delegStakePerCycleMap.get(c1) || 0n;
                    const total_amt = last_amt + dir_amt + buf_amt;
                    delegStakePerCycleMap.set(cycle, total_amt);
                }

                const ssnCycleInfoMap = rewardData.stakeSsnPerCycleMaps[ssnAddress]?.stake_ssn_per_cycle?.[ssnAddress] || {};

                for (const cycle of cyclesToCalculate) {
                    const cycleInfo = ssnCycleInfoMap[cycle];
                    if (!cycleInfo) continue;

                    const totalRewardsForCycle = BigInt(cycleInfo.arguments[1]);
                    const totalStakeForCycle = BigInt(cycleInfo.arguments[0]);
                    const delegStakeForCycle = delegStakePerCycleMap.get(cycle);

                    if (delegStakeForCycle && delegStakeForCycle > 0n && totalStakeForCycle > 0n) {
                        const cycleReward = (delegStakeForCycle * totalRewardsForCycle) / totalStakeForCycle;
                        totalSsnReward += cycleReward;
                    }
                }
            } catch (e) {
                console.error(`- Ошибка при расчете наград для узла ${ssnAddress}:`, e);
                totalSsnReward = 0n;
            }

            rewardsBySsn[ssnAddress] = totalSsnReward;
        }
        
        console.log(`✅ Расчет наград завершен.`);
        return rewardsBySsn;
    }

    async getStakedNodes(walletAddress: string): Promise<NodeStakeInfo[]> {
        console.log(`
 Поиск стейков для адреса: ${walletAddress}`);
        const normalizedAddress = this.normalizeAddress(walletAddress);
        console.log(` Нормализованный адрес: ${normalizedAddress}`);

        const initialQueries: Array<[string, string, any[]]> = [
            [this.implAddress, 'deposit_amt_deleg', [normalizedAddress]],
            [this.implAddress, 'ssnlist', []],
            [this.implAddress, 'lastrewardcycle', []],
            [this.implAddress, 'last_withdraw_cycle_deleg', [normalizedAddress]],
        ];

        try {
            const initialResults = await this.batchQuery(initialQueries);
            
            const depositsResult = initialResults[0]?.result;
            const ssnListResult = initialResults[1]?.result;
            const lastRewardCycleResult = initialResults[2]?.result;
            const lastWithdrawResult = initialResults[3]?.result;

            if (!depositsResult || !ssnListResult || !lastRewardCycleResult) {
                throw new Error('Не удалось получить основные данные из контракта');
            }

            const userDeposits = depositsResult.deposit_amt_deleg?.[normalizedAddress];
            
            if (!userDeposits || Object.keys(userDeposits).length === 0) {
                console.log('❌ У данного адреса нет активных стейков');
                return [];
            }
            
            const ssnList = ssnListResult.ssnlist;
            if (!ssnList) throw new Error('Не удалось получить список узлов');

            const rewardQueries: Array<[string, string, any[]]> = [];
            const stakedSsnAddresses = Object.keys(userDeposits);

            for (const ssnAddr of stakedSsnAddresses) {
                rewardQueries.push([this.implAddress, 'stake_ssn_per_cycle', [ssnAddr]]);
                rewardQueries.push([this.implAddress, 'direct_deposit_deleg', [normalizedAddress, ssnAddr]]);
                rewardQueries.push([this.implAddress, 'buff_deposit_deleg', [normalizedAddress, ssnAddr]]);
                rewardQueries.push([this.implAddress, 'deleg_stake_per_cycle', [normalizedAddress, ssnAddr]]);
            }

            const rewardQueryResults = await this.batchQuery(rewardQueries);
            
            const rewardData: RewardCalculationData = {
                lastRewardCycle: parseInt(lastRewardCycleResult.lastrewardcycle),
                lastWithdrawCycleMap: lastWithdrawResult,
                stakeSsnPerCycleMaps: {},
                directDepositMaps: {},
                buffDepositMaps: {},
                delegStakePerCycleMaps: {},
            };
            
            let queryIndex = 0;
            for (const ssnAddr of stakedSsnAddresses) {
                rewardData.stakeSsnPerCycleMaps[ssnAddr] = rewardQueryResults[queryIndex++]?.result;
                rewardData.directDepositMaps[ssnAddr] = rewardQueryResults[queryIndex++]?.result;
                rewardData.buffDepositMaps[ssnAddr] = rewardQueryResults[queryIndex++]?.result;
                rewardData.delegStakePerCycleMaps[ssnAddr] = rewardQueryResults[queryIndex++]?.result;
            }
            
            const rewardsBySsn = await this.calculateRewards(normalizedAddress, userDeposits, rewardData);

            console.log(`
 Найдено стейков на ${Object.keys(userDeposits).length} узлах:`);
            console.log('='.repeat(81));

            const stakedNodes: NodeStakeInfo[] = [];
            let totalStaked = 0n;
            let totalRewards = 0n;

            for (const [ssnAddress, stakeAmountStr] of Object.entries(userDeposits)) {
                const ssnInfo = ssnList[ssnAddress];
                
                if (!ssnInfo) {
                    console.log(`⚠️  Узел 0x${ssnAddress} не найден в списке`);
                    continue;
                }

                const ssnArgs = ssnInfo.arguments;
                const ssnName = ssnArgs[3] || 'Неизвестно';
                const commissionRate = BigInt(ssnArgs[7] || '0');
                const isActive = ssnArgs[0]?.constructor === 'True';
                const status = isActive ? 'Активен' : 'Неактивен';
                
                const stakeAmount = BigInt(stakeAmountStr as string);
                const rewardsAmount = rewardsBySsn[ssnAddress] || 0n;
                
                totalStaked += stakeAmount;
                totalRewards += rewardsAmount;

                const nodeInfo: NodeStakeInfo = { ssnName, ssnAddress: `0x${ssnAddress}`, stakeAmount, rewardsAmount, commissionRate, status };
                stakedNodes.push(nodeInfo);

                console.log(`
 Узел: ${ssnName}`);
                console.log(`     Адрес: 0x${ssnAddress}`);
                console.log(`     Стейк (Qa): ${stakeAmount.toString()}`);
                console.log(`     Награды (Qa): ${rewardsAmount.toString()}`);
                console.log(`     Комиссия (10^7): ${commissionRate.toString()}`);
                console.log(`     Статус: ${status}`);
            }

            console.log(`
${'='.repeat(81)}`);
            console.log(` ОБЩАЯ СТАТИСТИКА:`);
            console.log(`     Всего узлов со стейком: ${stakedNodes.length}`);
            console.log(`     Общая сумма стейка (Qa): ${totalStaked.toString()}`);
            console.log(`     Общая сумма невостребованных наград (Qa): ${totalRewards.toString()}`);
            console.log(`     Сеть: Mainnet`);
            console.log('='.repeat(81));

            return stakedNodes;

        } catch (error) {
            console.error('❌ Ошибка при получении стейков:', error);
            throw error;
        }
    }
}