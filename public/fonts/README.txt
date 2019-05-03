If you want to browse and download Google Fonts, you can use W3 on Rachel,
which uses our local mirror of Google Fonts behind the scenes. 

http://192.168.109.2/modules/en-w3schools/www.w3schools.com/howto/howto_googlefonts.asp.html

To add a new font to the Workbench:

1. After placing the CSS file in /public/css and its supporting TTF files in /public/fonts,
you can add a link to the new css file in the underlying jade file, like this:

... in /server/views/partials/react-stylesheets.jade:

link(rel='stylesheet', type='text/css' href='/css/anton.css')

Alternately you can import CSS files within less files, like this:

@import url("/css/anton.css");

2. Then set the font-family attribute to 'Anton' in the style for your text element.
