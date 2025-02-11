const googleSearchService = require('../services/googleSearchService');

class SearchController {
    async search(req, res) {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({ 
                error: 'Query parameter "q" is required' 
            });
        }

        try {
            const results = await googleSearchService.search(query);
            
            if (!results || results.length === 0) {
                return res.status(404).json({
                    error: 'No results found',
                    query: query
                });
            }

            res.json({ 
                success: true,
                query: query,
                count: results.length,
                results 
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ 
                error: 'An error occurred while performing the search',
                message: error.message,
                query: query
            });
        }
    }
}

module.exports = new SearchController(); 