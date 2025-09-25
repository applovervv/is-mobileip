/**
 * 통신사 상수 정의
 */
const CARRIERS = {
  SK_TELECOM: "SK Telecom",
  KT: "KT",
  LG_U_PLUS: "LG U+",
};

/**
 * 모바일 통신사 IP 범위 정의
 */
const MOBILE_IP_RANGES = {
  // 단일 IP 범위 (startsWith 방식)
  single: [
    "203.226",
    "211.234",
    "39.7",
    "110.70",
    "175.223",
    "211.246",
    "118.235",
    "211.36",
    "211.235",
    "106.101",
    "106.102",
    "125.188",
    "117.111",
  ],

  // IP 범위 (start ~ end)
  ranges: [
    { start: "27.160", end: "27.183" },
    { start: "223.32", end: "223.63" },
    { start: "42.35", end: "42.36" },
  ],

  // IPv6 범위
  ipv6: ["2001:2d8:", "2001:e60:31", "2001:e60:", "2001:4430:"],
};

/**
 * IP 주소를 숫자로 변환 (IPv4 전용)
 * @param {string} ip - IP 주소 (예: "192.168.1.1")
 * @returns {number} - 숫자로 변환된 IP
 */
function ipToNumber(ip) {
  return (
    ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
  );
}

/**
 * IP 범위 체크 (IPv4 전용)
 * @param {string} ip - 확인할 IP
 * @param {string} startIp - 시작 IP
 * @param {string} endIp - 끝 IP
 * @returns {boolean} - 범위 내에 있으면 true
 */
function isInRange(ip, startIp, endIp) {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(startIp + ".0.0");
  const endNum = ipToNumber(endIp + ".255.255");
  return ipNum >= startNum && ipNum <= endNum;
}

/**
 * IPv6 주소인지 확인
 * @param {string} ip - IP 주소
 * @returns {boolean} - IPv6이면 true
 */
function isIPv6(ip) {
  return ip.includes(":");
}

/**
 * IPv4 주소인지 확인
 * @param {string} ip - IP 주소
 * @returns {boolean} - IPv4이면 true
 */
function isIPv4(ip) {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipv4Regex.test(ip);
}

/**
 * 모바일 통신사 IP인지 확인하는 메인 함수
 * @param {string} userIp - 사용자 IP 주소
 * @returns {boolean} - 모바일 통신사 IP이면 true, 아니면 false
 */
function isMobileCarrierIP(userIp) {
  if (!userIp || typeof userIp !== "string") {
    return false;
  }

  // IPv6 체크
  if (isIPv6(userIp)) {
    return MOBILE_IP_RANGES.ipv6.some((prefix) =>
      userIp.toLowerCase().startsWith(prefix.toLowerCase())
    );
  }

  // IPv4 체크
  if (!isIPv4(userIp)) {
    return false;
  }

  // 단일 IP 범위 체크 (startsWith 방식)
  for (const prefix of MOBILE_IP_RANGES.single) {
    if (userIp.startsWith(prefix + ".")) {
      return true;
    }
  }

  // IP 범위 체크
  for (const range of MOBILE_IP_RANGES.ranges) {
    if (isInRange(userIp, range.start, range.end)) {
      return true;
    }
  }

  return false;
}

/**
 * 통신사별 상세 정보를 반환하는 함수 (선택사항)
 * @param {string} userIp - 사용자 IP 주소
 * @returns {object|null} - 통신사 정보 객체 또는 null
 */
function getMobileCarrierInfo(userIp) {
  if (!isMobileCarrierIP(userIp)) {
    return null;
  }

  // 통신사별 IP 매핑 (HTML 표 기준으로 정확하게 매핑)
  const carrierMapping = {
    203.226: CARRIERS.SK_TELECOM,
    211.234: CARRIERS.SK_TELECOM, // 5G에서 사용
    211.235: CARRIERS.SK_TELECOM, // 5G에서 사용

    39.7: CARRIERS.KT,
    "110.70": CARRIERS.KT,
    175.223: CARRIERS.KT,
    211.246: CARRIERS.KT,
    118.235: CARRIERS.KT, // 4G, 5G에서 사용

    106.102: CARRIERS.LG_U_PLUS, // 4G에서 사용
    125.188: CARRIERS.LG_U_PLUS, // 4G에서 사용
    117.111: CARRIERS.LG_U_PLUS, // 4G에서 사용
    211.36: CARRIERS.LG_U_PLUS, // 4G에서 사용
    106.101: CARRIERS.LG_U_PLUS, // 5G에서 사용
  };

  // 범위 IP에 대한 통신사 매핑
  const rangeCarrierMapping = {
    "27.160-27.183": CARRIERS.SK_TELECOM, // 4G
    "223.32-223.63": CARRIERS.SK_TELECOM, // 4G, 5G, 로밍
    "42.35-42.36": CARRIERS.SK_TELECOM, // 로밍
  };

  // IPv6에 대한 통신사 매핑
  const ipv6CarrierMapping = {
    "2001:2d8:": CARRIERS.SK_TELECOM, // 4G, 5G
    "2001:e60:31": CARRIERS.KT, // 4G
    "2001:e60:": CARRIERS.KT, // 5G
    "2001:4430:": CARRIERS.LG_U_PLUS, // 5G
  };

  // IPv6인 경우
  if (isIPv6(userIp)) {
    for (const [prefix, carrier] of Object.entries(ipv6CarrierMapping)) {
      if (userIp.toLowerCase().startsWith(prefix.toLowerCase())) {
        return {
          isMobile: true,
          carrier: carrier,
          ipVersion: "IPv6",
          ipPrefix: prefix,
        };
      }
    }
    return {
      isMobile: true,
      carrier: "Mobile Carrier (IPv6)",
      ipVersion: "IPv6",
    };
  }

  // IPv4 단일 IP 범위에 대한 통신사 매핑 시도
  for (const [prefix, carrier] of Object.entries(carrierMapping)) {
    if (userIp.startsWith(prefix + ".")) {
      return {
        isMobile: true,
        carrier: carrier,
        ipVersion: "IPv4",
        ipPrefix: prefix,
      };
    }
  }

  // IPv4 범위 IP에 대한 통신사 매핑 시도
  for (const range of MOBILE_IP_RANGES.ranges) {
    if (isInRange(userIp, range.start, range.end)) {
      const rangeKey = `${range.start}-${range.end}`;
      const carrier = rangeCarrierMapping[rangeKey] || "Mobile Carrier (Range)";
      return {
        isMobile: true,
        carrier: carrier,
        ipVersion: "IPv4",
        ipRange: `${range.start} ~ ${range.end}`,
      };
    }
  }
  return {
    isMobile: true,
    carrier: "Mobile Carrier (Unknown)",
    ipVersion: "IPv4",
  };
}

module.exports = {
  isMobileCarrierIP,
  getMobileCarrierInfo,
};
