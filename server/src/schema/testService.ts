import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useMemo } from 'react';

const useGetTestMsg = () => {
  type res = {
    test: string
  }
  const queryRes = useQuery<res>(gql`
    query test {
      test
    }
  `);
  const testResponse = useMemo(() => (
    queryRes.data && queryRes.data.test ? queryRes.data.test : undefined
  ), [queryRes.data]);

  if (queryRes.error) {
    console.log(queryRes.error)
    // getStore().dispatch(notificationErrorAction(`Failed to get orders: ${queryRes.error}`));
  }

  return {
    ...queryRes,
    msg: testResponse
  }
}

export {
  useGetTestMsg,
}
