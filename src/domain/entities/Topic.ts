/**
 * Domain Entity: Topic
 * 주제 & 아침 제시어 모델
 */

export interface Topic {
  id: string;
  topic: string;       // 주제명 (예: "하루 의도 설정")
  prompts: string[];   // 제시어 목록
}
