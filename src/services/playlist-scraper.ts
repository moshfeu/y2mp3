import * as cheerio from 'cheerio';

const getPlaylistPageContent = async (playlistURL: string) => {
  const playlistId = new URL(playlistURL).searchParams.get('list');
  const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`);
  if (!response.ok) {
    switch (response.status) {
      case 403:
        throw new Error('Playlist is private or not accessible to the app');
      case 400:
      case 404:
        throw new Error('Invalid playlist URL');
      default:
        throw new Error('Failed to fetch playlist page');
    }
  }
  return response.text();
}

export const scrap = async (playlistURL: string) => {
  const data = await getPlaylistPageContent(playlistURL);

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
};
