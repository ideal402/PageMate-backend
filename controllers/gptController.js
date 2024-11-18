const fs = require('fs');
const OpenAI = require('openai');
require('dotenv').config();
const apiKey = process.env.API_KEY;
const openai = new OpenAI({ apiKey: apiKey });

const gptController = {};

// few-shot 프롬프트 생성 함수
function generateFewShotPrompt(samplesData, review) {
    let samples = [];
    samplesData.forEach(sample => {
        samples.push(`${sample.author}의 ${sample.title} 책에 대한 리뷰입니다.\n${sample.review}`);
    });

    let prompt = "아래의 샘플 리뷰들로 스타일(반말여부, 구어체여부,자주 쓰이는 기교(변화법,강조법,비유법), 문체 등)을 학습해주세요. :\n\n";
    samples.forEach((sample, index) => {
        prompt += `### 샘플 ${index + 1}\n${sample}\n\n`;
    });

    prompt += "### 다음 학습한 스타일을 토대로 리뷰를 바꿔주세요, 다만 추가적인 문장을 생성하진 마시오.\n";
    prompt += review;
    return prompt;
}

// review_object : {author, title, review}
// reviews : [{author, title, review}, {author, title, review}, ...]

// 스타일 학습
gptController.styleLearning = async (req, res) => {
    try {
        const {reviews,review_object} = req.body; 
        const { author, title, review } = review_object;
        const prompt = generateFewShotPrompt(reviews, review);

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.5
            
        });

        const generatedReview = response.choices[0].message.content;
        res.status(200).json({ status: "success" , data: generatedReview});
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

// 문체 변환  
// style : 화려체, 구어체, 문어체 등
gptController.styleChange = async (req, res) => {
    try {
        const { style, review_object } = req.body;
        const { author, title, review } = review_object;

        const prompt = `글의 문체를 ${style}로 바꿔주시고 추가적인 문장을 생성하지 마시오.\n${review}`;   
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.5
        });

        const generatedReview = response.choices[0].message.content;

        res.status(200).json({ status: "success" , data: generatedReview});
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};


//내용 첨삭
gptController.contentCorrection = async (req, res) => {
    try {
        const { review_object } = req.body;
        const { author, title, review } = review_object;

        const prompt = `다음은 ${author}의 ${title} 책에 대한 리뷰 이고, 이 리뷰의 스타일(반말여부, 구어체여부,자주 쓰이는 기교(변화법,강조법,비유법), 문체 등)을 유지하며 맞춤법을 교정하고 내용 첨삭을 해주세요. \n${review}`;   
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        const generatedReview = response.choices[0].message.content;

        res.status(200).json({ status: "success" , data: generatedReview});
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};


gptController.spellingCorrection = async (req, res) => {
    try {
        const { review_object } = req.body;
        const { author, title, review } = review_object;

        const prompt = `다음은 ${author}의 ${title} 책에 대한 리뷰 이고, 이 리뷰에 문장을 추가하지 말고 맞춤법만을 교정해주세요. \n${review}`;   
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.3
        });

        const generatedReview = response.choices[0].message.content;

        res.status(200).json({ status: "success" , data: generatedReview});
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = gptController;