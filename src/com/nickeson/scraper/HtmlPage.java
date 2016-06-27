package com.nickeson.scraper;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;

public class HtmlPage
{
    public static String getPage()
    {
        StringWriter sw = new StringWriter();
        try
        {
            URL url = new URL("http://www.siliconmtn.com");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setDoOutput(true);
            InputStream content = (InputStream) connection.getInputStream();
            BufferedReader in = new BufferedReader(new InputStreamReader(content));
            String line;
            while ((line = in.readLine()) != null)
            {
                sw.append(line).append("\n");
            }

        } catch (Exception e)
        {
            e.printStackTrace();
        }
        return sw.getBuffer().toString();
    }
}