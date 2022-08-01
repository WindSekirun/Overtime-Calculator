export class Question {
    question: string;
    answer: string;

    constructor(question: string, answer: string) {
        this.question = question;
        this.answer = answer;
    }
}

export const frequencyQuestions: Question[] = [
    {
        "question": "데이터는 어디에 저장되나요?",
        "answer": "별도 서버가 아닌 브라우저 저장소 내 저장됩니다."
    },
    {
        "question": "휴일 시간 입력은 어떻게 할까요?",
        "answer": "휴일 시간은 현재 지원되지 않습니다. 수동으로 계산하려면, 8시간 이상 근무시 2.0 / 미만 1.5를 가산하면 됩니다."
    },
    {
        "question": "휴일 시간 입력은 어떻게 할까요?",
        "answer": "휴일 시간은 현재 지원되지 않습니다. 수동으로 계산하려면, 8시간 이상 근무시 2.0 / 미만 1.5를 가산하면 됩니다."
    },
]