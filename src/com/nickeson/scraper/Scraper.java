package com.nickeson.scraper;

//JDK 1.8.0
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

// log4j-1.2.17.jar
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/****************************************************************************
 * <b>Title</b>: Scraper.java <p/>
 * <b>Project</b>: SMT Site Menu Scraper <p/>
 * <b>Description: </b>A website scraper to locally save content 
 * (HTML, .css, .js, etc.) and header information for all pages found in the 
 * Siliconmtn.com header and footer menu links, while retaining absolute links 
 * to other content (images, audio, video, etc.)<p/>
 * <b>Copyright:</b> Copyright (c) 2016<p/>
 * <b>Company:</b> Silicon Mountain Technologies<p/>
 * @author nickeson
 * @version 1.0
 * @since Jun 22, 2016<p/>
 * updates:
 ****************************************************************************/

public class Scraper {
	private static Logger log = null;
	private int connectionStatus = 0;
	private HttpURLConnection httpConnection = null;
	private Properties config = null;
	private String basePort = null;
	private	String sessionID = null;
	private URL baseDomain = null;
	public static final String ACCEPT_CHARSET = "acceptCharset";
	public static final String BASE_DOMAIN = "baseDomain";
	public static final String BASE_PORT = "basePort";
	public static final String LOG4J_LOCATION = "log4Jlocation";	
	public static final String MENU_PARSE_STRING = "menuParseString";
	public static final String SESSIONID_PARSE_STRING = "sessionIdParseString";

	/**
	 * default constructor uses a predefined properties file
	 */
	public Scraper() {
		try {
			// James mentioned using InputStreamReader here
			FileInputStream fileInput = new FileInputStream("scripts/scraper.properties");
			config = new Properties();
			config.load(fileInput);
			fileInput.close();
		} catch (FileNotFoundException e) {
			log.error("Properties File Not Found");
			e.printStackTrace();
		} catch (IOException e) {
			log.error("Cannot load or close Properties File");
			e.printStackTrace();
		} 
		loadScraperConfig();
	}

	/**
	 * setup logger and setup member variables from scraper's config file
	 */
	public void loadScraperConfig() {
		// load log4J configuration & setup Logger
		PropertyConfigurator.configure(config.getProperty(LOG4J_LOCATION));
		log = Logger.getLogger("Scraper");
		try {
			basePort = config.getProperty(BASE_PORT);
			baseDomain = new URL(config.getProperty(BASE_DOMAIN) + ":" + basePort);
			baseDomain.openConnection().setRequestProperty(ACCEPT_CHARSET, 
					config.getProperty(ACCEPT_CHARSET)); // unnecessary?
			httpConnection = (HttpURLConnection)baseDomain.openConnection();
		} catch (MalformedURLException mue) {
			log.error("URL is invalid/malformed");
			mue.printStackTrace();
		} catch (IOException ioe) {
			log.error("Unable to make URL connection");
			ioe.printStackTrace();
		}
	}

	/**
	 * Store JSESSIONID cookie (if present)
	 */
	public void storeSessionIdCookie() {
		try {
			connectionStatus = httpConnection.getResponseCode();
			if (connectionStatus == HttpURLConnection.HTTP_OK) {
				Map<String, List<String>> headerFields = httpConnection.getHeaderFields();
				Set<String> headerKeys = headerFields.keySet();
				for (String headerKey : headerKeys) {
					if ("Set-Cookie".equalsIgnoreCase(headerKey)) {
						List<String> headerValues = headerFields.get(headerKey);
						for (String headerValue : headerValues) {
							String[] fields = headerValue.split("; ");
							String cookie = fields[0];
							String[] cookieValues = cookie.split("=");
							String cookieName = cookieValues[0];
							String cookieValue = cookieValues[1];
							if (cookieName.equalsIgnoreCase(config.getProperty(SESSIONID_PARSE_STRING))) {
								sessionID = cookieValue;
								if (cookieValue == null) {
									log.error("Can't store " + config.getProperty(SESSIONID_PARSE_STRING));
								}
							}
						}
					}
				}
				System.out.println(config.getProperty(SESSIONID_PARSE_STRING) + ": " + sessionID); // for testing
			} else {
				log.error("Status Code: " + connectionStatus);
			} // end if
		} catch (IOException e) {
			log.error("Cannot make HttpURLConnection");
			e.printStackTrace();
		}
	}

	/**
	 * Store all valid connection stream data to specified file
	 * @param url the URL of the data to store
	 * @param file the location to store the stream data
	 */
	public void storeData(URL url, String file) {
		BufferedReader in = null;
		BufferedWriter out = null;
		String inputLine = null;
		try {
			connectionStatus = httpConnection.getResponseCode();
			in = new BufferedReader(new InputStreamReader(url.openStream()));
			out = new BufferedWriter(new FileWriter(new File(file)));
			if (connectionStatus == HttpURLConnection.HTTP_OK) {
				while ((inputLine = in.readLine()) != null) {
					System.out.println(inputLine);
					out.write(inputLine + "\n");
				}
				in.close();
				out.close();
			} else {
				log.error("Status Code: " + connectionStatus);
			}
		} catch (IOException ioe) {
			log.error("Unable to store data - connection or filesystem errors");
			ioe.printStackTrace();
		}
	}
	

	// unit test
	public static void main(String[] args) {
		Scraper scraper = new Scraper();
//		scraper.storeData(scraper.baseDomain, "output/index.html");
		scraper.storeSessionIdCookie();
	} // end main

} // end class definition