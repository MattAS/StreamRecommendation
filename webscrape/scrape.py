from selenium import webdriver
import time
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


def main():
    f = open("streamer.txt", "w")

    PATH = 'D:\BU\CS 506\streamRecommendation\webscrape\chromedriver.exe'
    driver = webdriver.Chrome(PATH)

    page_num = 1
    streamer_list = []

    while page_num != 20:
        logger.debug("Starting Page {}...".format(page_num))
        try:
            driver.get(
                'https://twitchtracker.com/channels/viewership/english?page={}'.format(page_num))
            time.sleep(5)
            streamers = driver.find_elements_by_xpath('//td//a')
            for streamer in streamers:
                streamer_list.append(streamer.text)
            page_num += 1
        except Exception as e:
            logger.debug(e)
            driver.quit()

    for streamer in streamer_list:
        try:
            f.write(streamer.lower().strip()+'\n')
        except Exception as e:
            logger.debug(e)

    logger.debug("Finished scrape...")
    f.close()
    driver.quit()


if __name__ == "__main__":
    main()
