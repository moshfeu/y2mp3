import * as cheerio from 'cheerio';
import * as miniget from 'miniget';

const fetchWithMiniget = async (url: string) => {
  return miniget(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
  }).text();
}

const getPlaylistPageContent = async (playlistURL: string) => {
  try {
    const playlistId = new URL(playlistURL).searchParams.get('list');
    const response = await fetchWithMiniget(`https://www.youtube.com/playlist?list=${playlistId}`);
    return response;
  } catch (error /*: Miniget.MinigetError */) {
    console.log('failed to fetch playlist page', error);
    switch (error.statusCode) {
      case 403:
        throw new Error('Playlist is private or not accessible to the app');
      case 400:
        throw new Error('Invalid playlist URL');
      case 404:
        throw new Error('Playlist not found');
      default:
        throw new Error('Failed to fetch playlist page');
    }
  }
}

export const scrap = async (playlistURL: string) => {
  const data = await getPlaylistPageContent(playlistURL);

  try {
    const $ = cheerio.load(data);
    const ytInitialData = $('script').filter((_index, tag) => {
      const html = cheerio.html(tag);
      return html.includes('ytInitialData');
    })[0];

    const [jsonStr] = /{.*}/gm.exec(cheerio.html(ytInitialData));
    const info = JSON.parse(jsonStr);
    const {
      contents,
    } = info.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
    const songs = contents
      .filter(({ playlistVideoRenderer }) => playlistVideoRenderer)
      .map(({ playlistVideoRenderer }) => ({
        id: playlistVideoRenderer.videoId,
        name: playlistVideoRenderer.title.runs[0].text,
      }));

    const hasMore = contents.length > songs.length

    return {
      name: info.metadata.playlistMetadataRenderer.title,
      playlist: songs,
      hasMore,
    };
  } catch (err) {
    console.error(err);
    throw new Error('The playlist may be private, or the URL is invalid');
  }
};
