export interface Option {
    id: string;
    option_text: string;
    is_correct: boolean;
}

export interface ContextPassage {
    id: string;
    passage_text: string;
}

export interface Question {
    id: string;
    question_text: string;
    type: string;
    topic?: string;
    difficulty?: string;
    explanation?: string;
    passage_text?: string;
    options: Option[];
    context_passage?: ContextPassage;
    sources?: string[];
    image_url?: string;
    image_dark_url?: string;
    image_dark_invert?: boolean;
}
