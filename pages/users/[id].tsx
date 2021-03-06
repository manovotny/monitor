import type {GetStaticProps, GetStaticPaths} from 'next';
import type {ReactElement} from 'react';

import type {User} from '../../interfaces';
import {sampleUserData} from '../../utils/sample-data';
import Layout from '../../components/Layout';
import ListDetail from '../../components/ListDetail';

type Props = {
    item?: User;
    errors?: string;
};

const StaticPropsDetail = ({item, errors}: Props): ReactElement => {
    if (errors) {
        return (
            <Layout title="Error | Next.js + TypeScript Example">
                <p>
                    <span style={{color: 'red'}}>{'Error:'}</span> {errors}
                </p>
            </Layout>
        );
    }

    return (
        <Layout title={`${item ? item.name : 'User Detail'} | Next.js + TypeScript Example`}>
            {item && <ListDetail item={item} />}
        </Layout>
    );
};

const getStaticPaths: GetStaticPaths = () => {
    // Get the paths we want to pre-render based on users
    const paths = sampleUserData.map((user) => ({
        params: {id: user.id.toString()},
    }));

    // We'll pre-render only these paths at build time.
    // { fallback: false } means other routes should 404.
    return {
        fallback: false,
        paths,
    };
};

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries.
const getStaticProps: GetStaticProps = ({params}) => {
    try {
        const id = params?.id;
        const item = sampleUserData.find((data) => data.id === Number(id));

        // By returning { props: item }, the StaticPropsDetail component
        // will receive `item` as a prop at build time
        return {props: {item}};
    } catch (error) {
        return {props: {errors: error instanceof Error ? error.message : '`getStaticProps` error'}};
    }
};

export default StaticPropsDetail;

export {getStaticPaths, getStaticProps};
