import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(props: HomeProps) {
  const [posts, setPosts] = useState(props.postsPagination.results);
  const [newPosts, setNewPosts] = useState(props.postsPagination.next_page);

  async function getNewPosts() {
    const fetchedNewPosts = await fetch(newPosts).then(response =>
      response.json()
    );

    const newPostsFiltered = fetchedNewPosts.results.map((post: Post) => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...newPostsFiltered]);
    setNewPosts(fetchedNewPosts.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | Space Travelling</title>
      </Head>

      <main
        className={`${commonStyles.containerCommon} ${styles.containerHome}`}
      >
        <img src="/logo.svg" alt="logo" />

        <ul>
          {posts.map(post => (
            <li key={post.uid} className={styles.containerPost}>
              <Link href={`/post/${post.uid}`}>
                <a>
                  <h3>{post.data.title}</h3>
                  <p>{post.data.subtitle}</p>

                  <div className={styles.postInfo}>
                    <span>
                      <FiCalendar color="#BBBBBB" />
                      <time>
                        {format(
                          new Date(post.first_publication_date),
                          'dd MMM yyyy',
                          { locale: ptBR }
                        )}
                      </time>
                    </span>

                    <span>
                      <FiUser color="#BBBBBB" />
                      <p>{post.data.author}</p>
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>

        {newPosts && <h2 onClick={getNewPosts}>Carregar mais posts</h2>}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.subtitle',
        'posts.author',
        'posts.next_page',
      ],
      orderings: '[document.first_publication_date desc]',
      pageSize: 2,
    }
  );

  const { next_page } = postsResponse;

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // console.log(results)

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};
