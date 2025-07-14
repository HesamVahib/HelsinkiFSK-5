const Display = ({tag: Tag, text, children}) => {
    return (
        <Tag>
            {text || children}
        </Tag>
    );
}

const ErrorDisplay = ({color, message}) => {
    return (
        <h2 style={{
            color,
            margin: '10px 0',
            backgroundColor: '#c1c1c1ff',
            padding: '10px',
            border: `2px solid ${color}`
        }}>
            {message}
        </h2>
    );
}

export { Display, ErrorDisplay };