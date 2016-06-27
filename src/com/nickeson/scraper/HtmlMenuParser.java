package com.nickeson.scraper;

import java.io.Reader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import javax.swing.text.MutableAttributeSet;
import javax.swing.text.html.HTML;
import javax.swing.text.html.HTMLEditorKit;
import javax.swing.text.html.parser.ParserDelegator;

public class HtmlMenuParser {

    public static void main(String[] args) throws Exception {
        String html = HtmlPage.getPage();
        Reader reader = new StringReader(html);
        HTMLEditorKit.Parser parser = new ParserDelegator();
        final List<String> links = new ArrayList<String>();
        parser.parse(reader, new HTMLEditorKit.ParserCallback()
        {
            public void handleStartTag(HTML.Tag t, MutableAttributeSet a, int pos)
            {
                if (t == HTML.Tag.A)
                {
                    Object link = a.getAttribute(HTML.Attribute.HREF);
                    if (link != null)
                    {
                        links.add(String.valueOf(link));
                    }
                }
            }
        }, true);
        reader.close();
        for (String l : links)
        {
        	System.out.println(l);
        }
    }
}