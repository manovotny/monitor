import type {ReactElement, ReactNode} from 'react';
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({children, title = 'Home'}: Props): ReactElement => (
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
                </Link>
                {' | '}
                <Link href="/music">
                    <a>{'Music'}</a>
                </Link>
                {' | '}
                <Link href="/movies">
                    <a>{'Movies'}</a>
                </Link>
            </nav>
            <hr />
        </header>
        {children}
        <footer>
            <hr />
            <p>{'Footer'}</p>
        </footer>
    </>
);

export default Layout;
