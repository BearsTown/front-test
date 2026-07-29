/**
 * 평가항목별 토지이용 행 필터 정의
 *
 * LandSelectDialog 표시 필터링과 seedTestData 초기 자동 선택 두 곳에서 공유.
 * 새 항목 추가 시 이 파일에만 등록하면 양쪽에 자동 반영됨.
 */

// code → (row) => boolean
// 정의되지 않은 code는 필터 없음(전체 표시)으로 처리
export const ROW_FILTERS = {
  DA001: row => ['공원', '녹지'].some(kw =>
    [row.항목, row.세부항목, row.세분류].some(f => f?.includes(kw))
  ),
  DA002: row => ['공원', '녹지', '저류', '하천', '수도용지'].some(kw =>
    [row.항목, row.세부항목, row.세분류].some(f => f?.includes(kw))
  ),
  DR002: row => row.구분?.includes('주거용지'),
}

/**
 * 주어진 rows 배열에서 itemCode 필터를 통과하는 원본 인덱스 목록 반환
 * @param {string}   itemCode
 * @param {object[]} rows     - landStore.dataRows 전체 배열
 * @returns {number[]}        - 원본 인덱스 배열
 */
export function getFilteredIndices(itemCode, rows) {
  const filterFn = ROW_FILTERS[itemCode]
  return rows
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => !filterFn || filterFn(row))
    .map(({ idx }) => idx)
}
