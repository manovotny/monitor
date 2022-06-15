import type {ReactElement} from 'react';
import Link from 'next/link';

import type {User} from '../types';

type Props = {
    data: User;
};

const ListItem = ({data}: Props): ReactElement => (
    <Link as={`/users/${data.id}`} href="/users/[id]">
        <a>
            {data.id}
            {': '}
            {data.name}
        </a>
    </Link>
);

export default ListItem;
