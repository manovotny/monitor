import type {ReactElement} from 'react';

import Layout from '../components/Layout';
import Search from '../components/Search';

const IndexPage = (): ReactElement => (
    <Layout>
        <Search />
    </Layout>
);

export default IndexPage;
