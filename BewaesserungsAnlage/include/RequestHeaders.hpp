#include <sstream>


class RequestHeaders{
    public:
        RequestHeaders();
        explicit RequestHeaders(std::string header);
        std::string getMethod();
        std::string getUrl();
        std::string getContentType();
        int getContentLength();


    private:
        void parseHeaders(std::string header);
        std::string method;
        std::string url;
        std::string content_type;
        std::string content_length;
};

RequestHeaders::RequestHeaders(){};

std::string RequestHeaders::getMethod(){
    return method;
}

std::string RequestHeaders::getUrl(){
    return url;
}

std::string RequestHeaders::getContentType(){
    return content_type;
}

int RequestHeaders::getContentLength(){
    return std::stoi(content_length);
}

/**
 * @brief Construct a new Request Headers:: Request Headers object
 * 
 * Constructor simply parses the header and initialises the attributes
 * 
 * @param headers the headers to be parsed 
 */
RequestHeaders::RequestHeaders(std::string headers){
    parseHeaders(headers);
}
/**
 * @brief Basic method to parse an HTTP Request headers
 * 
 * Method only saves the HTTP method, the URL, the Content-type and the Content-Length
 * and ignores every other header because they are irrelevant to the router
 * @param:
 *  String headers: The HTTP headers to be parsed
**/
void RequestHeaders::parseHeaders(std::string headers){
    // read the headers with a stream
    std::istringstream s{headers};
    std::string line;
    // get the first line of the headers
    std::getline(s, line);
    // headers first line always contains the HTTP method and the url the request
    // was sent to seperated by whitespace
    method = line.substr(0, line.find_first_of(" "));
    url = line.substr(line.find_first_of(" ") + 1, line.substr(line.find_first_of(" ") + 1, line.size()).find_first_of(" "));
    std::string lel{};
    lel.append("Content-Type");
    std::string lul{};
    lul.append("Content-Length");
    // search through the rest of the headers for content type/length
    while(std::getline(s, line)){
        // header and header value are seperated by a :
        int endOfWord = line.find(":");
        // if : was found
        if(endOfWord != std::string::npos){
            std::string header = line.substr(0, endOfWord);
            if(header.compare(lel) == 0){
                content_type = line.substr(endOfWord + 1, line.find_first_of("\n"));
            }
            else if(header.compare(lul) == 0){
                content_length = line.substr(endOfWord + 1, line.find_first_of("\n"));
            } 
        }
    }
}
