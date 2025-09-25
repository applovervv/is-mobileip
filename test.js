var { isMobileCarrierIP, getMobileCarrierInfo } = require("./");

const ip = "255.255.255.255";
const isMobileIP = isMobileCarrierIP(ip);
const carrierInfo = getMobileCarrierInfo(ip);

console.log("통신사IP 여부 : ", isMobileIP);
console.log("통신사 정보 : ", carrierInfo);
