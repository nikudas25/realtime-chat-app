import React, { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Layout({ children }){
    return (
        <Fragment>
            <Head>
                <title>Realtime Chat App</title>

                <link>
                rel = "stylesheet"
                href = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
                </link>
            </Head>
        </Fragment>
    )
}