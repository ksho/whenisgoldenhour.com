import NextHead from 'next/head';

type HeadProps = {
    title?: string;
    description?: string;
};

// Lives outside pages/ so it stays a component instead of becoming a route.
export default function Head({
    title = 'when is golden hour?',
    description = '',
}: HeadProps) {
    return (
        <NextHead>
            <title>{title}</title>
            <meta name="author" content="Karl Shouler" />
            <meta name="description" content={description} />
            <meta property="og:title" content={title} />
            <meta property="og:type" content="website" />
            <meta property="og:description" content={description} />
        </NextHead>
    );
}
