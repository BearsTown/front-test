import DA001Body from './evalBodies/DA001Body.vue'
import DA002Body from './evalBodies/DA002Body.vue'
import DR001Body from './evalBodies/DR001Body.vue'
import DR002Body from './evalBodies/DR002Body.vue'
import DR003Body from './evalBodies/DR003Body.vue'
import DR004Body from './evalBodies/DR004Body.vue'
import DR005Body from './evalBodies/DR005Body.vue'
import DummyBody from './evalBodies/DummyBody.vue'

// code → Body 컴포넌트 매핑
// 새 항목 구현 시 이 파일에만 추가
const REGISTRY = {
  DA001: DA001Body,
  DA002: DA002Body,
  DR001: DR001Body,
  DR002: DR002Body,
  DR003: DR003Body,
  DR004: DR004Body,
  DR005: DR005Body,
}

export function getEvalBodyComponent(code) {
  return REGISTRY[code] ?? DummyBody
}
