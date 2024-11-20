const axios = require("axios");
const bookController = {};

bookController.searchBooks = async (req, res) => {
    const { query, page = 1 } = req.query; // 검색어, 페이지, 페이지 크기 가져오기
    const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY; // Kakao REST API Key 환경 변수에서 가져오기
    const pageNumber = Number(page); // 숫자로 변환

    if (isNaN(pageNumber)) {
        return res.status(400).json({ error: "유효하지 않은 페이지 번호입니다." });
    }

    console.log("요청된 페이지:", pageNumber); // 디버깅: 페이지 번호 확인

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
                page : pageNumber, // 페이지 번호
                size : 10, // 한 페이지당 결과 수
            },
        });

        const results = response.data.documents.map((item) => ({
            title: item.title,
            authors: item.authors,
            thumbnail: item.thumbnail,
            publisher: item.publisher,
        }));

        res.json({
            results,
            meta: {
                totalCount: response.data.meta.total_count,
                pageableCount: response.data.meta.pageable_count,
                isEnd: response.data.meta.is_end,
                page: pageNumber,
            },
        });
    } catch (error) {
        console.error("Kakao API 요청 중 오류 발생:", error.message);
        res.status(500).json({ error: "Kakao API 요청 중 문제가 발생했습니다." });
    }
};

bookController.getBestSellers = async (req, res) => {
    const ALADIN_API_KEY = process.env.ALADIN_REST_API_KEY; // Kakao REST API Key 환경 변수에서 가져오기
    const url = `http://www.aladin.co.kr/ttb/api/ItemList.aspx?MaxResults=10&start=1&SearchTarget=Book&Cover=Big&output=js&Version=20131101&ttbkey=${ALADIN_API_KEY}&QueryType=Bestseller&Year=2024&Month=11&Week=1`
    console.log('url',url)
        try {
        const response = await axios.get(url);
        // console.log('response', response.data);
        // console.log('length', response.data);
        res.status(200).json({status: 'success', data: response.data})
    } catch (error) {
        console.error('Error fetching bestsellers:', error);
        res.status(400).json({status: 'fail', error: error.message})
    }
}
module.exports = bookController;