import { Default } from 'components/layouts/Default';
import { GetServerSideProps, NextPage } from 'next';
import { getSession } from 'next-auth/react';
import { TicTacToe } from 'components/templates/TicTacToe';

const MicroBlogPage: NextPage = () => {
  return (
    <Default pageName="TIC-TAC-TOE">
      <TicTacToe />
    </Default>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session?.user.address) {
    return { props: { error: 'Connect your wallet first' } };
  }

  return {
    props: {},
  };
};

export default MicroBlogPage;
