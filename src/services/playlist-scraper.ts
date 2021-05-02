import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const scrap = async (playlistURL: string) => {
  const playlistId = new URL(playlistURL).searchParams.get('list');
  const data = await (
    await fetch(`https://www.youtube.com/playlist?list=${playlistId}`)
  ).text();

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
