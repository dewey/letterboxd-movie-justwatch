const axios = require("../helpers/axios");
const { getCacheValue, setCacheValue } = require("../helpers/redis");
const cacheTtl = process.env.CACHE_TTL || 3600; // 1h (seconds)

const searchMovie = async (req, res) => {
  try {
    const { title, year } = req.body;
    const countryCode = req.body.country || "es_UY";

    if (!title) {
      console.log("No movie title");
      return res.status(404).json({ message: "Movie not found" });
    }

    const cacheKey = `search-movie:${title}:${year}:${countryCode}`;
    const cachedResponse = await getCacheValue(cacheKey);
    if (cachedResponse) {
      const status = cachedResponse.error ? 404 : 200;
      console.log("Response found (cached)");
      return res.status(status).json(cachedResponse);
    }

    const movieDbAPIKey = process.env.MOVIE_DB_API_KEY;
    const PROXY = "";

    // Search for movie on MovieDB API
    let encodedTitle = encodeURIComponent(title);
    const movieDbResponse = await axios.get(
      `${PROXY}https://api.themoviedb.org/3/search/movie?query=${encodedTitle}${
        year ? `&year=${year}` : ""
      }&api_key=${movieDbAPIKey}`
    );
    const movieDbData = movieDbResponse.data.results[0];

    if (!movieDbData) {
      const response = { error: "Movie not found" };
      await setCacheValue(cacheKey, response, cacheTtl);
      return res.status(404).json(response);
    }

    // Get title and year from MovieDB API
    const movieId = movieDbData.id;

    // Search for movie on JustWatch API using title and year
    const justWatchResponse = await axios.get(
      `${PROXY}https://api.justwatch.com/content/titles/${countryCode}/popular?body={"query": "${encodedTitle} ${year}"}`
    );

    // Search for movie data in the JustWatch response based on the movie ID from MovieDB API
    // This is done to filter out movies JustWatch "suggests" but are not necessarily the same movie
    const movieData = justWatchResponse.data.items.find((item) => {
      const tmdbId = item.scoring.find(
        (score) => score.provider_type === "tmdb:id"
      );
      return tmdbId && tmdbId.value === movieId;
    });

    if (!movieData) {
      const response = { error: "Movie not found" };
      await setCacheValue(cacheKey, response, cacheTtl);
      return res.status(404).json(response);
    }

    if (!movieData.offers || !movieData.offers.length) {
      const response = {
        error: "No streaming services offering this movie (JustWatch)",
      };
      await setCacheValue(cacheKey, response, cacheTtl);
      return res.status(404).json(response);
    }

    let streamingServices = movieData.offers
      .filter(
        (offer) =>
          offer.monetization_type === "flatrate" ||
          offer.monetization_type === "free" ||
          offer.monetization_type === "ads"
      )
      .map((offer) => offer.provider_id);
    streamingServices = [...new Set(streamingServices)];

    // Get clear names for streaming services
    const providerResponse = await axios.get(
      `${PROXY}https://apis.justwatch.com/content/providers/locale/${countryCode}`
    );
    const providers = providerResponse.data;
    const clearNames = streamingServices
      .map((service) => {
        const provider = providers.find((provider) => provider.id === service);
        return provider ? provider.clear_name : null;
      })
      .filter((name) => name !== null);

    if (!clearNames || !clearNames.length) {
      const services = streamingServices.join(", ");
      const response = {
        error: `Unable to identify providers offering media. Provider id(s): ${services} (JustWatch)`,
      };
      await setCacheValue(cacheKey, response, cacheTtl);
      return res.status(404).json(response);
    }

    const response = {
      message: "Movie found",
      streamingServices: clearNames,
    };
    await setCacheValue(cacheKey, response, cacheTtl);
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { searchMovie };