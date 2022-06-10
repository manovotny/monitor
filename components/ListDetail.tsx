import type {ReactElement} from 'react';

import type {User} from '../interfaces';

type ListDetailProps = {
    item: User;
};

const ListDetail = ({item: user}: ListDetailProps): ReactElement => (
    <>
        <h1>
            {'Detail for '}
            {user.name}
        </h1>
        <p>
            {'ID: '}
            {user.id}
        </p>
    </>
);

export default ListDetail;
