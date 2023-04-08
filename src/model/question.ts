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
        "question": "계산되는 금액은 세금 공제 전인가요, 후인가요?",
        "answer": "세금 공제 전 기준으로 계산됩니다. 총 소득에 따라 소득세율이 결정되므로 소득세율을 알고있다면 어느정도 계산은 할 수 있습니다."
    },
    {
        "question": "데이터는 어디에 저장되나요?",
        "answer": "별도 서버가 아닌 브라우저 저장소 내 저장됩니다."
    }
]