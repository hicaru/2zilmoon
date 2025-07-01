// Конвертация Qa в ZIL (1 ZIL = 10^12 Qa)
const QA_TO_ZIL = 1000000000000n;

export const formatQaToZil = (qa: bigint): string => {
  const zil = Number(qa) / Number(QA_TO_ZIL);
  
  if (zil === 0) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: zil < 1 ? 6 : 2,
  });
  
  return formatter.format(zil);
};

export const formatQaWithUnit = (qa: bigint, showUnit: boolean = true): string => {
  const zil = formatQaToZil(qa);
  return showUnit ? `${zil} ZIL` : zil;
};

export const formatLargeNumber = (value: bigint): string => {
  const num = Number(value);
  
  if (num >= 1e9) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2
    }).format(num);
  }
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(num);
};

export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }

  address = address.replace("0x", "");
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

export const formatCommissionRate = (rate: bigint): string => {
  const rateNumber = Number(rate) / 10000000;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rateNumber / 100);
};

export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

