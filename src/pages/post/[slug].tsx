import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>{ post?.data?.title } | Space Travelling</title>
      </Head>

      <Header />

      {router.isFallback ? (
        <h1>Carregando...</h1>
      ) : (
        <>
          <img className={styles.banner} src={post?.data?.banner?.url} alt={post?.data?.title} />

          <article className={`${commonStyles.containerCommon} ${styles.containerPost}`}>
            <h1>{post?.data?.title}</h1>
            <div>
              <span>
                <FiCalendar />
                <time>
                  {format(new Date(post?.first_publication_date),
                  "dd MMM yyyy",
                  {locale: ptBR})}
                </time>
              </span>
              <span>
                <FiUser />
                <p>{post?.data?.author}</p>
              </span>
              <span>
                <FiClock />
                <p>4 min</p>
              </span>
            </div>

            { post?.data?.content?.map(content => (
              <div className={styles.postContent} key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }}
                />
              </div>
            )) }
          </article>
        </>
      )}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const { results } = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 2,
  })

  const paths = results.map(post => ({
    params: {
      slug: post.uid
    }
  }))

  return {
    fallback: true,
    paths,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient()
  const response = await prismic.getByUID('posts', String(slug), {})

  // console.log(JSON.stringify(response, null, 2))

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  }

  return {
    props: {
      post,
    },
    redirect: 60 * 30,
  }
}
