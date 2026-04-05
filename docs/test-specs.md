# y2mp3 Test Specifications

---

## 1. Download Tab — URL Input & Fetch States

### 1.1 Idle state on app launch
**Given** the app has just launched and no previous session is active  
**When** the Download tab is visible  
**Then** the URL input field is empty  
**And** no format selector, quality selector, or download button is visible  
**And** the fetch button (→) is disabled  

---

### 1.2 Typing an invalid URL keeps the fetch button disabled
**Given** the URL input field is empty  
**When** the user types a string that is not a valid YouTube URL (e.g. `"hello"`, `"https://example.com"`, `"youtube.com"`)  
**Then** the fetch button (→) remains disabled  
**And** pressing Enter does not trigger a fetch  

---

### 1.3 Typing a valid YouTube video URL enables the fetch button
**Given** the URL input field is empty  
**When** the user types a valid YouTube video URL (e.g. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)  
**Then** the fetch button (→) becomes enabled  

---

### 1.4 Clicking the fetch button triggers a fetch
**Given** a valid YouTube video URL has been entered  
**When** the user clicks the fetch button (→)  
**Then** a loading spinner appears  
**And** the URL input field becomes non-editable (locked)  
**And** the fetch button is no longer clickable  

---

### 1.5 Pressing Enter with a valid URL triggers a fetch
**Given** a valid YouTube video URL has been entered  
**When** the user presses Enter  
**Then** the same loading state is shown as when clicking the fetch button  

---

### 1.6 Fetch spinner and locked state during network request
**Given** a fetch has been triggered  
**When** the network request is in progress  
**Then** a spinner is visible within or near the URL input area  
**And** the URL input field is locked and cannot be edited  
**And** the fetch button remains inactive  

---

### 1.7 Fetch error state — invalid or unavailable video
**Given** a fetch was triggered with a URL that results in an error  
**When** the server returns an error or the video is unavailable  
**Then** the URL input field shows a red ring (error highlight)  
**And** an inline error message appears below the field describing the failure  
**And** the spinner disappears  
**And** the input field is unlocked  

---

### 1.8 Retry fetch after error by pressing Enter
**Given** the URL field is in an error state (red ring, inline error visible)  
**When** the user presses Enter  
**Then** a new fetch attempt is triggered  
**And** the error state clears  
**And** the loading spinner reappears  

---

### 1.9 Retry fetch after error by clicking fetch button
**Given** the URL field is in an error state  
**When** the user clicks the fetch button (→)  
**Then** a new fetch attempt is triggered  
**And** the error state clears  
**And** the loading spinner reappears  

---

### 1.10 Fetch success — single video card appears
**Given** a valid YouTube video URL was entered and fetched successfully  
**When** the response is received  
**Then** a video card appears showing:
- The video thumbnail
- The video title
- The author/channel name
- The video duration  
**And** a format selector becomes visible  
**And** a quality selector becomes visible  
**And** a Download button becomes visible  

---

### 1.11 Fetch success — playlist card appears
**Given** a valid YouTube playlist URL (with `list=PL…`) was entered and fetched successfully  
**When** the response is received  
**Then** a playlist card appears with a list of entries  
**And** each entry shows: thumbnail (or index fallback), title, and duration  
**And** a format selector becomes visible  
**And** a quality selector becomes visible  
**And** a "Download All" button becomes visible  
**And** no single-video Download button is shown  

---

### 1.12 Mixed URL shows video card and playlist banner
**Given** a URL containing both `v=` (video ID) and `list=PL…` (playlist ID) is entered and fetched successfully  
**When** the response is received  
**Then** a single video card is shown for the video  
**And** a yellow "Fetch playlist →" banner appears below or near the video card  
**And** the standard format/quality/Download controls for the single video are visible  

---

### 1.13 Clicking the playlist banner on a mixed URL fetches the playlist
**Given** a mixed URL has been fetched and the yellow "Fetch playlist →" banner is showing  
**When** the user clicks the "Fetch playlist →" banner  
**Then** the app fetches the playlist  
**And** the view transitions to the playlist card  
**And** the yellow banner disappears  

---

### 1.14 Radio/mix URL treated as single video, no playlist banner
**Given** a YouTube URL with `list=RD…` (radio/mix list) is entered  
**When** the user triggers a fetch  
**Then** the app treats it as a single video  
**And** a video card appears (thumbnail, title, author, duration)  
**And** no yellow "Fetch playlist →" banner appears  

---

### 1.15 Auto-paste when app gains focus with YouTube URL in clipboard
**Given** the clipboard contains a valid YouTube URL  
**And** the URL input field is currently empty  
**When** the app window gains focus (e.g. user switches back to the app)  
**Then** the YouTube URL is automatically pasted into the URL input field  
**And** a toast notification appears confirming the auto-paste  

---

### 1.16 Auto-paste does not trigger when field already contains text
**Given** the clipboard contains a valid YouTube URL  
**And** the URL input field already contains some text  
**When** the app window gains focus  
**Then** the field contents are not changed  
**And** no auto-paste toast appears  

---

### 1.17 Auto-paste does not trigger when clipboard does not contain a YouTube URL
**Given** the clipboard contains a string that is not a YouTube URL  
**And** the URL input field is empty  
**When** the app window gains focus  
**Then** the field remains empty  
**And** no toast appears  

---

## 2. Download Tab — Single Video Download Flow

### 2.1 Video card remains visible throughout download
**Given** a single video has been fetched and the video card is visible  
**When** the user clicks the Download button  
**Then** the video card remains visible and does not disappear or collapse  
**And** the format/quality controls are no longer interactive  

---

### 2.2 Progress bar and percentage shown during download
**Given** a single video download is in progress  
**When** the download is underway  
**Then** a progress bar is visible within the video card  
**And** a percentage value is displayed alongside the progress bar  
**And** the percentage updates as the download progresses  

---

### 2.3 Download speed and ETA shown during download
**Given** a single video download is in progress  
**When** data is being received  
**Then** the current download speed is displayed inline in the card (e.g. "1.2 MB/s")  
**And** an estimated time remaining (ETA) is displayed inline in the card  

---

### 2.4 Download completes with success indicator
**Given** a single video download was in progress  
**When** the download finishes successfully  
**Then** the progress bar is replaced by a "✅ Done" indicator  
**And** the speed and ETA labels disappear  

---

### 2.5 "Show in Finder" button appears after successful download (filepath available)
**Given** a single video download has completed successfully  
**And** the output file path is known  
**When** the "✅ Done" state is shown  
**Then** a "📂 Show in Finder" button is visible in the video card  

---

### 2.6 "Show in Finder" button absent when filepath is unavailable
**Given** a single video download has completed  
**But** no file path is available (e.g. the file location could not be determined)  
**When** the "✅ Done" state is shown  
**Then** no "📂 Show in Finder" button is displayed  

---

### 2.7 Clicking "Show in Finder" reveals the file in Finder
**Given** a single video download has completed and the "📂 Show in Finder" button is visible  
**When** the user clicks "📂 Show in Finder"  
**Then** macOS Finder opens and the downloaded file is highlighted/revealed  

---

### 2.8 Inline error shown when download fails
**Given** a single video download was in progress  
**When** the download fails (network error, conversion error, etc.)  
**Then** the progress bar disappears  
**And** an error message is displayed inline within the video card  
**And** no "✅ Done" indicator is shown  
**And** no "📂 Show in Finder" button is shown  

---

### 2.9 "Start over" resets the download tab to idle
**Given** the download tab is in any post-fetch state (success, error, or done)  
**When** the user clicks "Start over"  
**Then** the URL input field is cleared and unlocked  
**And** the video card disappears  
**And** the format, quality, and download controls are hidden  
**And** the tab returns to the idle state  

---

## 3. Download Tab — Playlist Download Flow

### 3.1 Each playlist row shows expected metadata
**Given** a playlist URL has been fetched successfully  
**When** the playlist card is rendered  
**Then** each row shows:
- A thumbnail image, or a numeric index placeholder if no thumbnail is available
- The video title
- The video duration  

---

### 3.2 Pending rows show individual Download button
**Given** a playlist has been fetched and no bulk "Download All" is active  
**When** the playlist rows are in their initial pending state  
**Then** each row shows a "⬇ Download" button  

---

### 3.3 Clicking individual "⬇ Download" starts that row's download
**Given** a playlist is loaded and a row is in the pending state  
**When** the user clicks the "⬇ Download" button on that row  
**Then** that row transitions to a downloading state  
**And** a progress bar and percentage are shown inline for that row  
**And** the "⬇ Download" button is no longer shown for that row  
**And** other rows remain unaffected  

---

### 3.4 Downloading row shows progress bar and percentage
**Given** a playlist row download is in progress  
**When** data is being received  
**Then** a progress bar is visible inline within that row  
**And** a percentage value is shown and updates as download progresses  
**And** no "⬇ Download" button is visible for that row  

---

### 3.5 Completed row shows "📂 Show file" button (filepath available)
**Given** a playlist row download has completed successfully  
**And** the output file path is known  
**When** the row transitions to the done state  
**Then** the progress bar disappears  
**And** a "📂 Show file" button is visible in the row  
**And** the row title appears muted/dimmed  

---

### 3.6 Completed row without filepath shows no "📂 Show file" button
**Given** a playlist row download has completed  
**But** no file path is available  
**When** the row transitions to the done state  
**Then** no "📂 Show file" button is displayed for that row  
**And** the row title still appears muted/dimmed  

---

### 3.7 Failed row shows retry button and inline error
**Given** a playlist row download has failed  
**When** the row transitions to the error state  
**Then** a "↺ Retry" button is visible in the row  
**And** an inline error message is displayed in that row  
**And** no progress bar is shown  

---

### 3.8 Clicking "↺ Retry" restarts a failed row download
**Given** a playlist row is in the failed state with a "↺ Retry" button  
**When** the user clicks "↺ Retry"  
**Then** the row transitions back to a downloading state  
**And** the inline error message disappears  
**And** the "↺ Retry" button disappears  
**And** a progress bar appears  

---

### 3.9 "Download All" starts downloading all entries sequentially or in parallel
**Given** a playlist has been fetched  
**When** the user clicks the "Download All" button  
**Then** all rows begin downloading (either one at a time or concurrently per app behavior)  
**And** each row transitions from pending to downloading state as it starts  
**And** individual "⬇ Download" buttons are no longer shown while bulk download is active  

---

### 3.10 Cancel stops the active bulk download
**Given** a "Download All" is in progress  
**When** the user clicks the Cancel button  
**Then** the download(s) in progress stop  
**And** rows not yet started remain in a pending state  
**And** rows already completed retain their done state  
**And** the Cancel button disappears  

---

### 3.11 Summary banner appears on full completion
**Given** a "Download All" was started  
**When** all rows have reached either a done or failed state  
**Then** a summary banner appears  
**And** the banner indicates how many items were downloaded successfully and how many failed  

---

### 3.12 Summary banner does not appear after manual Cancel before completion
**Given** a "Download All" is in progress  
**When** the user cancels before all rows have finished  
**Then** no completion summary banner is shown  

---

## 4. Settings

### 4.1 Settings accessible via keyboard shortcut
**Given** the app is open on any tab  
**When** the user presses ⌘, (macOS) or Ctrl+, (Windows/Linux)  
**Then** the Settings view becomes visible  

---

### 4.2 Output path is displayed in settings
**Given** the Settings view is open  
**When** the user views the output path section  
**Then** the currently configured output directory path is displayed  

---

### 4.3 Browsing for a new output path updates the displayed path
**Given** the Settings view is open  
**When** the user clicks the Browse button next to the output path  
**Then** a native folder picker dialog opens  
**And** if the user selects a folder and confirms, the displayed path updates to reflect the new selection  

---

### 4.4 Dismissing the folder picker does not change the output path
**Given** the Settings view is open and the folder picker has been opened  
**When** the user dismisses or cancels the folder picker without selecting a folder  
**Then** the output path displayed in settings remains unchanged  

---

### 4.5 "Save playlists in a subfolder" checkbox persists its state
**Given** the Settings view is open  
**When** the user toggles the "Save playlists in a subfolder" checkbox  
**And** saves the settings  
**And** navigates away and returns to Settings  
**Then** the checkbox reflects the value that was saved  

---

### 4.6 Playlist subfolder setting is respected on next playlist download
**Given** the "Save playlists in a subfolder" checkbox is checked and settings are saved  
**When** the user downloads a playlist  
**Then** the downloaded files are placed in a subfolder named after the playlist within the output directory  

---

### 4.7 Playlist subfolder setting NOT active means flat output
**Given** the "Save playlists in a subfolder" checkbox is unchecked and settings are saved  
**When** the user downloads a playlist  
**Then** the downloaded files are placed directly in the configured output directory (no subfolder)  

---

### 4.8 Format select persists its default value
**Given** the user opens Settings and changes the default format (e.g. from MP3 to WAV)  
**When** the user saves and navigates away, then returns to Settings  
**Then** the format select shows the value that was saved  

---

### 4.9 Quality select persists its default value
**Given** the user opens Settings and changes the default quality (e.g. from 128kbps to 320kbps)  
**When** the user saves and navigates away, then returns to Settings  
**Then** the quality select shows the value that was saved  

---

### 4.10 Saved format and quality are pre-selected on the Download tab
**Given** the user has saved a specific format and quality in Settings  
**When** the user fetches a video on the Download tab  
**Then** the format selector shows the saved format  
**And** the quality selector shows the saved quality  

---

### 4.11 Theme select offers system, light, and dark options
**Given** the Settings view is open  
**When** the user opens the theme selector  
**Then** three options are available: "System", "Light", and "Dark"  

---

### 4.12 Selecting "Light" theme applies a light appearance
**Given** the Settings view is open  
**When** the user selects "Light" and saves  
**Then** the app UI switches to a light color scheme  

---

### 4.13 Selecting "Dark" theme applies a dark appearance
**Given** the Settings view is open  
**When** the user selects "Dark" and saves  
**Then** the app UI switches to a dark color scheme  

---

### 4.14 Selecting "System" theme follows the OS appearance
**Given** the Settings view is open  
**When** the user selects "System" and saves  
**Then** the app UI matches the current operating system appearance (light or dark)  

---

### 4.15 Saving settings shows a "✅ Saved!" confirmation
**Given** the Settings view is open and the user has made changes  
**When** the user clicks the Save button  
**Then** a "✅ Saved!" message appears in the settings area  
**And** the message disappears after a short period  

---

### 4.16 Settings survive switching tabs and returning
**Given** the user has made changes in Settings (but not yet saved, or has saved)  
**When** the user navigates away to the Download tab or History tab  
**And** then navigates back to the Settings view  
**Then** the settings values are not reset; they reflect what was last saved or are still showing unsaved changes  

---

## 5. History Tab

### 5.1 History tab shows past downloads
**Given** the user has previously downloaded one or more files  
**When** the user opens the History tab  
**Then** a list of past download entries is shown  
**And** each entry includes at minimum the video title and author  

---

### 5.2 History is empty when no downloads have been made
**Given** no downloads have ever been made (or history was cleared)  
**When** the user opens the History tab  
**Then** an empty state is shown (e.g. a message indicating no history)  
**And** no download entries appear  

---

### 5.3 Searching filters entries by title
**Given** the History tab contains multiple entries  
**When** the user types a string that matches one or more entry titles into the search field  
**Then** only entries whose title contains the search string are shown  
**And** non-matching entries are hidden  

---

### 5.4 Searching filters entries by author
**Given** the History tab contains multiple entries  
**When** the user types a string that matches one or more entry authors into the search field  
**Then** only entries whose author contains the search string are shown  
**And** non-matching entries are hidden  

---

### 5.5 Search is case-insensitive
**Given** the History tab contains entries  
**When** the user searches using uppercase, lowercase, or mixed-case text  
**Then** matching entries are shown regardless of the case used  

---

### 5.6 Clearing the search field restores the full history list
**Given** the user has entered a search term that filters the history  
**When** the user clears the search field  
**Then** all history entries are shown again  

---

### 5.7 Completed entries show "📂" button
**Given** the History tab is open  
**When** an entry represents a successfully completed download  
**Then** a "📂" button is visible for that entry  

---

### 5.8 Clicking "📂" on a history entry opens Finder at the file location
**Given** a completed history entry has a "📂" button  
**When** the user clicks "📂"  
**Then** macOS Finder opens and the corresponding file is revealed/highlighted  

---

### 5.9 Failed entries do NOT show a "📂" button
**Given** the History tab is open  
**When** an entry represents a failed download  
**Then** no "📂" button is shown for that entry  

---

### 5.10 "Clear All" removes all history entries
**Given** the History tab contains one or more entries  
**When** the user clicks "Clear All"  
**Then** all entries are removed from the list  
**And** the empty state is displayed  

---

### 5.11 "Clear All" does not delete the downloaded files
**Given** the History tab contains entries for files that exist on disk  
**When** the user clicks "Clear All"  
**Then** the history entries are removed from the display  
**But** the actual downloaded files on disk are not deleted  

---

### 5.12 Refresh reloads history from storage
**Given** the History tab is open and potentially showing stale data  
**When** the user clicks the Refresh button  
**Then** the history list is reloaded from persistent storage  
**And** any entries that were added (e.g. by a download completing) since the tab was last loaded become visible  

---

### 5.13 History entry shows status indicator
**Given** the History tab contains entries  
**When** the user views an entry  
**Then** the entry visually indicates whether it completed successfully or failed (e.g. via a status icon or color)  

---

### 5.14 History persists across app restarts
**Given** the user has downloaded files during a previous app session  
**When** the user closes and reopens the app  
**And** navigates to the History tab  
**Then** the entries from the previous session are still present  

---

### 5.15 "Clear All" persists — history remains empty after restart
**Given** the user cleared all history entries  
**When** the user closes and reopens the app  
**And** navigates to the History tab  
**Then** the history is still empty  
