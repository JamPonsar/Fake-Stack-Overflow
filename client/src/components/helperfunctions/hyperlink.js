export default function includeHyperlink(body) {
    // Split the body text based on the pattern of [text](url)
    const split = body.split(/(\[.*?\]\(.*?\))/);
    
    const processedBody = split.map((part, index) => {
        if (index % 2 === 0) {
            // plaintext 
            return part;
        } else {
            // If the index is odd, it's a hyperlink, extract text and URL
            const text = part.match(/\[(.*?)\]/)[1];
            const url = part.match(/\((.*?)\)/)[1];
            return (
                <a key={index} href={url} target="_blank" rel="noreferrer">
                    {text}
                </a>
            );
        }
    });

    return processedBody;
}