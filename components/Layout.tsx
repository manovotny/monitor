import type {ReactElement, ReactNode} from 'react';
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({children, title = 'This is the default title'}: Props): ReactElement => (
    <>
        <Head>
            <title>{title}</title>
            <meta charSet="utf-8" />
            <meta content="initial-scale=1.0, width=device-width" name="viewport" />
        </Head>
        <header>
            <nav>
                <Link href="/">
                    <a>{'Home'}</a>
                </Link>{' '}
                {'|'}{' '}
                <Link href="/about">
                    <a>{'About'}</a>
                </Link>{' '}
                {'|'}{' '}
                <Link href="/users">
                    <a>{'Users List'}</a>
                </Link>{' '}
                {'| '}{' '}
                <Link href="/api/users">
                    <a>{'Users API'}</a>
                </Link>
            </nav>
        </header>
        {children}
        <footer>
            <hr />
            <span>{"I'm here to stay (Footer)"}</span>
        </footer>
    </>
);

export default Layout;
