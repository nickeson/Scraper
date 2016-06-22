package com.nickeson.scraper;

//JDK 1.8.0
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

// log4j-1.2.17.jar
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/****************************************************************************
 * <b>Title</b>: Scraper.java <p/>
 * <b>Project</b>: Website Scraper <p/>
 * <b>Description: </b> A website scraper to locally save HTML, css and header 
 * information for Siliconmtn.com and all pages found in header and footer menus
 * while retaining absolute links to other content (images, audio, video, etc.)<p/>
 * <b>Copyright:</b> Copyright (c) 2016<p/>
 * <b>Company:</b> Silicon Mountain Technologies<p/>
 * @author nickeson
 * @version 1.0
 * @since Jun 22, 2016<p/>
 * updates:
 ****************************************************************************/

public class Scraper {

	static Logger log = null;

	public Scraper() {
		PropertyConfigurator.configure("scripts/log4j.properties");
		log = Logger.getLogger("Scraper");
	}

	public static void main(String[] args) {
		Scraper scraper = new Scraper();
		URL url = null;
		URLConnection connection = null;
		BufferedReader in = null;
		HttpURLConnection httpConnection = null;
		int status = 0;
		String inputLine = null;

		try {
			url = new URL("http://www.siliconmtn.com");
			connection = url.openConnection();
			in = new BufferedReader(new InputStreamReader(url.openStream()));
			connection.setRequestProperty("Accept-Charset", "UTF-8");
			httpConnection = (HttpURLConnection)connection;
			status = httpConnection.getResponseCode();
			inputLine = null;

			if (status == 200) {
				while ((inputLine = in.readLine()) != null) {
					System.out.println(inputLine);
				}
			}
		} catch (MalformedURLException mue) {
			if (log.isDebugEnabled()) {
				log.debug("Malformed URL provided");
			}
			log.error("URL is invalid");
			mue.printStackTrace();
		} catch (IOException ioe) {
			if (log.isDebugEnabled()) {
				log.debug("An I/O Error Occured trying to access the URL");
			}
			log.error("An I/O Error Occured trying to access the URL");
			ioe.printStackTrace();
		} finally {
			try {
				in.close();
			} catch (IOException ioe) {
				// ignore this exception
			}
		} // end finally
	} // end main
} // end class definition