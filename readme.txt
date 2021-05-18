=== OpenSheetMusicDisplay ===
Contributors:      opensheetmusicdisplay, fredmeister77
Donate link:       https://OSMD.org/Donate
Tags:              block,shortcode,osmd,music,sheet music,musicxml,opensheetmusicdisplay
Requires at least: 5.5.0
Tested up to:      5.7.4
Stable tag:        1.1.0
Requires PHP:      7.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Block or shortcode to render MusicXML in the browser as sheet music using OSMD.

== Description ==

This Gutenberg block brings [OpenSheetMusicDisplay](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay) seamlessly to your Wordpress site!
This will allow you to render responsive MusicXML live in your visitors' browser.

It enables uploading of .xml, .musicxml and .mxl files to your Wordpress Media Library, which can then be selected in the block for rendering.

We have also added a shortcode in this plugin for those who do not use the Gutenberg editor.

## Block Options
The block has a number of options in the sidebar (Inspector Controls) described here.

### Rendering
The section immediately below the block heading contains two controls related to re-rendering the sheet music.

#### Automatically Rerender on Change
*Checkbox, Default: Off*
When this is on, any change to the lower settings (except for 'Container Aspect Ratio') will trigger a re-render of the sheet music in the editor.

This is not recommended for larger pieces of sheet music, as rendering can take time.
It is best to do 'batch' updates with the settings and use the 'Rerender' button to manually preview the changes.

#### Rerender
*Button*
This button will be disabled if the above setting is turned on.
This button is used to trigger a manual rerender of the sheet music in the currently selected OSMD block.
This is particularly useful for updating the settings of larger pieces of sheet music that take longer to render.

### Basic Options
This section contains basic options for the block: the musicXML file to render as well as some display options.

#### Select Media
*Button/File Select, Default: None Selected*
This control shows the currently selected score above it (if there is one).
The button 'Select Media' opens your Wordpress Media Library in a modal window, which allows you to select previously uploaded MusicXML, or to upload one to select for rendering in the block.

**NOTE:** Selecting a new file will always trigger a render of the new file, no matter if "Automatically Rerender on Change" is selected or not.

#### Width (%)
*Number Input, Default: 100*
This control translates directly to the CSS width of the sheet music.
What this means is that it controls the percentage of the *parent container* that the sheet music will take up.
e.g.
- If you have the OSMD block in a post set to 100%, it will fill the entire width of the post
- If you have the OSMD block in a column layout of a post set to 100%, it will fill the entire width of that column

#### Container Aspect Ratio
*Dropdown/Number Input, Default: Auto (No Scrollbar)*
This dropdown sets the aspect ratio of the sheet music container - The height in relation to the width.
What this does pratically is add a scrollbar, which is useful with very long pieces that you don't want to extend all the way down the page.
- Auto (No Scrollbar) will render the full sheet music as-is, taking up as much room as needed.
- Landscape makes the height 0.667x the width. Or, put another way, the width will be 1.5x the height (3:2)
- Portrait sets the height to 1.778x the width. Width being 0.5625x the height (9:16)
- Custom allows you to set your own value of what the width will be divided by to get the height.

**NOTE:** This control does not trigger or require a re-render since it is merely a CSS property of the sheet music container. It will be reflected immediately.

#### Zoom (%)
*Number Input, Default: 100*
This input allows you to control the zoom level of the rendered sheet music.

### Drawing Options
These are additional OSMD drawing options - Whether to render certain parts of the sheet music.

#### Draw Title
*Checkbox, Default: On*
Whether to render the sheet music title.

**NOTE:** Draw Subtitle must be off for this to be reflected in the sheet music (currently).

#### Draw Subtitle
*Checkbox, Default: On*
Whether to render the sheet music subtitle.

#### Draw Composer
*Checkbox, Default: On*
Whether to render the sheet music composer.

**NOTE:** There seem to be some rendering issues in OSMD with this option if 'Draw Lyricist' is not off as well. We are working on this.

#### Draw Lyricist
*Checkbox, Default: On*
Whether to render the sheet music Lyricist.

#### Draw Metronome Marks
*Checkbox, Default: On*
Whether to render the tempo markings.

#### Draw Part Names
*Checkbox, Default: On*
Whether to render the part names before each stave.

#### Draw Part Abbreviations
*Checkbox, Default: On*
Whether to render the part abbreviations on subsequent music systems.

#### Draw Measure Numbers
*Checkbox, Default: On*
Whether to render measure numbers

#### Draw Measure Numbers Only at System Start
*Checkbox, Default: Off*
Whether to render measure numbers just at the start of new music systems.

#### Draw Time Signatures
*Checkbox, Default: On*
Whether to render time signatures on the staves

##Shortcode Options

The shortcode has the same options as above, though as attributes written in camelCase.

In the shortcode any checkbox attribute values are specified with true or false.
Numeric values can be specified as float or integers.

To specify the musicXML you need to provide a URL; This can be copied from your Media center in Wordpress when viewing the details of a file.

The shortcode is "opensheetmusicdisplay". Example given with full set of attributes:
```
[opensheetmusicdisplay musicXmlUrl="http://url.com/wp-content/uploads/sites/2/2021/02/Beethoven_AnDieFerneGeliebte.xml" zoom="0.75" width="75" 
    drawTitle="false" drawSubtitle="false" drawComposer="true" drawLyricist="true" drawMetronomeMarks="false" drawPartNames="false" drawPartAbbreviations="false"
    drawMeasureNumbers="true" drawMeasureNumbersOnlyAtSystemStart="true" drawTimeSignatures="true"]
```

It's important to note that zoom is out of 1: so 1 = 100%, 0.75 = 75%, 2 = 200%, etc.

== About Us ==

We have developed the open-source [OpenSheetMusicDisplay](https://opensheetmusicdisplay.org/): A library for rendering MusicXML in the browser using Vexflow.
We created this plugin to make it as easy as possible for Wordpress users to use our library to render sheet music on their site.
We hope you find this plugin useful, and if so, please consider sponsoring us or donating at our link above.
Thank you!

== Installation ==

1. Install the plugin via the Wordpress Plugin installer. 
    1. In the Wordpress admin sidebar, navigate to Plugins -> Add New.
    2. *Wordpress Automatic Installation*
        1. Search for its listing near the top of this page: "OpenSheetMusicDisplay".
        2. Review the plugin information, reviews, details, etc.
        3. Click "Install Now" and Wordpress will automatically install it.
    2. **or** *Manual Upload*
        1. At the very top towards the left, select the "Upload Plugin" button. 
        2. Select the zip file for this plugin.
        3. Click "Install Now"
2. Activate the Plugin
    1. In the Wordpress admin sidebar, navigate to Plugins -> Installed Plugins
    2. Locate the "OpenSheetMusicDisplay" plugin in this list
    3. Select "Activate" beneath it

This plugin should also be available via the Gutenberg Block directory:
1. Navigate to a post where you want to add sheet music.
2. Click the "+" icon to add a new block
3. Select "Browse all" at the bottom of the block selection pop-up
4. in the search bar at the top of the side panel, type "musicxml"
5. Click "Add Block" on the "OpenSheetMusicDisplay" result

**NOTE:** If updating to version 1.0.0 from previous versions, you will need to "Attempt Recovery" on anywhere the block has been included.
We have switched to server-side rendering, and this should now not happen with future updates.

== Frequently Asked Questions ==

= Where can I receive support for this block? =

Please contact us at support@opensheetmusicdisplay.org

= Is feature x, y, or z available? Will it be available? =

We are planning to release a premium extension to this plugin for more exciting and advanced features such as:
- Audio player
- Transpose
- Annotations
- Many OSMD Rendering Options
- A lot more!

Finally, this block has extensibility and plugin hooks (Currently not well documented, but will be). 
If you are a Wordpress/javascript developer and are feeling bold and adventurous, you might be able to add the functionality yourself.

== Screenshots ==

1. This is a two-column post example with the OSMD block in the second column with zoom level set. Shows Basic options to the right.
2. This shows the previous post on the public-facing side.
3. This shows the media selector where you can choose MusicXML.
4. This shows another post with various options set (75% width, no draw title, Portrait aspect ratio)

== Changelog ==

= 1.1.0 =
* Update to OSMD release 1.0.0. All changes here: https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/discussions/1021
* Added shortcode functionality
* Bugfixes for quote syntax issues

= 1.0.1 =
**Minor updates for plugin extensions**
* Allow more than one queueable attribute at a time
* Add additional filter hooks
* Fixes for resize on block editor

= 1.0.0 =
**Updates to this version may require all OSMD blocks to be 'Attempt Recovery'.  This will not cause any issues and it is fine to recover the blocks.**
* Refactor code to include WP filters
    * Allows plugin extensions easily
* Switch to dynamic server-side rendering
    * When new attributes are added in updates/plugins, won't flag the block as invalid
* Do no include scripts on other admin pages
    * Now checks page before including OSMD Javascript to prevent conflicts on other admin pages
* Fix bug for width not changing with certain themes

= 0.9.4 =
* Update to latest OSMD version
* Fixes for user-facing loading spinner
    * Will no longer take up whole Screen, just sheet music area
* Fixes for re-render trigger
    * Will only re-render when width of sheet music container is actually updated (fixes Chrome mobile issue on scroll)
* Attempts to reload sheet music 5 times before showing user error

= 0.9.2 =
* Initial Release