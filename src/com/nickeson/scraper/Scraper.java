package com.nickeson.scraper;

//JDK 1.8.0
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
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
	private Configurator scraperConfig = null;
	private HttpURLConnection httpConnection = null;
	private URL baseDomain = null;
	private String basePort = null;
	private	String sessionIdCookie = null;
	private	String sessionIdCookieParse = null;	
	private int connectionStatus = 0;
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
		scraperConfig = new Configurator(new File("scripts/scraper.properties"));
		loadScraperConfig();
	}

	/**
	 * convenience constructor to pass a properties file during Scraper instantiation
	 */
	public Scraper(String configFile) {
		scraperConfig = new Configurator(new File(configFile));
		loadScraperConfig();
	}
	
	/**
	 * setup logger and setup member variables from scraper's config file
	 */
	public void loadScraperConfig() {
		// load log4J configuration & setup Logger
		PropertyConfigurator.configure(scraperConfig.getConfig());
		log = Logger.getLogger("Scraper");
		try {
			basePort = scraperConfig.getConfig().getProperty(BASE_PORT);
			baseDomain = new URL(scraperConfig.getConfig().getProperty(BASE_DOMAIN) + ":" + basePort);
			baseDomain.openConnection().setRequestProperty(ACCEPT_CHARSET, 
					scraperConfig.getConfig().getProperty(ACCEPT_CHARSET)); // unnecessary?
			httpConnection = (HttpURLConnection)baseDomain.openConnection();
			sessionIdCookieParse = scraperConfig.getConfig().getProperty(SESSIONID_PARSE_STRING);
		} catch (MalformedURLException mue) {
			log.error("URL is invalid/malformed");
			mue.printStackTrace();
		} catch (IOException ioe) {
			log.error("Unable to make URL connection");
			ioe.printStackTrace();
		}
	}

	/**
	 * Store JSESSIONID cookie (if present) to member variable sessionIdCookie
	 */
	public void storeCookie() {
		try {
			connectionStatus = httpConnection.getResponseCode();
			if (connectionStatus == HttpURLConnection.HTTP_OK) {
				Map<String, List<String>> headerFields = httpConnection.getHeaderFields();
				Set<String> headerKeys = headerFields.keySet();

//				System.out.println(headerKeys); // for testing

				for (String headerKey : headerKeys) {
					if ("Set-Cookie".equalsIgnoreCase(headerKey)) {
						List<String> headerValues = headerFields.get(headerKey);
//						System.out.println(headerValues); // for testing

						for (String value : headerValues) {
							String[] fields = value.split("; ");
							String cookieValue = fields[0];
							System.out.println(cookieValue);
						}
					}
				}
//				String[] fields = cookies.split("; ");
//				String cookieValue = fields[0];
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
		scraper.storeCookie();
	} // end main

} // end class definition