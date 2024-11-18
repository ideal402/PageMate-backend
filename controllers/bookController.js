const axios = require("axios");
const bookController = {};

bookController.searchBooks = async (req, res) => {
    const { query } = req.query; // 검색어 가져오기
    const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY; // Kakao REST API Key 환경 변수에서 가져오기

    if (!query) {
        return res.status(400).json({ error: "검색어를 입력해주세요." });
    }

    try {
        // Kakao API 요청
        const response = await axios.get("https://dapi.kakao.com/v3/search/book", {
            headers: {
                Authorization: `KakaoAK ${KAKAO_API_KEY}`,
            },
            params: {
                query: query, // 검색어
                target: "title", // 제목 검색
            },
        });

        const results = response.data.documents.map((item) => ({
            title: item.title,
            authors: item.authors,
            thumbnail: item.thumbnail,
            publisher: item.publisher,
        }));

        res.json({ results });
    } catch (error) {
        console.error("Kakao API 요청 중 오류 발생:", error.message);
        res.status(500).json({ error: "Kakao API 요청 중 문제가 발생했습니다." });
    }
};

module.exports = bookController;