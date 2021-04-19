import React from 'react'
import Router from 'next/router'
import Head from 'next/head'

export default (
  redirectUrl: string,
  options?: { asUrl?: string; statusCode?: number, passParams?: boolean }
) =>
  class extends React.Component {
    // Redirects on the server side first if possible
    static async getInitialProps({ res, req }) {
      if (res?.writeHead) {
        if (req && req.url && options?.passParams && req.url.includes('?')) {
					// Overwrite and pass params if any set
          const params = req.url.substring(req.url.indexOf('?'));
          const safeRedirectUrl = redirectUrl.substring(0, redirectUrl.indexOf('?'));

          res.writeHead(options?.statusCode ?? 301, { Location: safeRedirectUrl + params });
          res.end();
        } else {
          res.writeHead(options?.statusCode ?? 301, { Location: redirectUrl })
          res.end()
        }
      }
      return {}
    }

    // Redirects on the client with JavaScript if no server
    componentDidMount() {
      let href = options?.asUrl ?? redirectUrl;
      if (options?.passParams && window.location.href.includes('?')) {
        const params = window.location.href.substring(window.location.href.indexOf('?'));
        const safeRedirectUrl = href.substring(0, href.indexOf('?'));
        href = safeRedirectUrl + params;
      }

      if (options?.asUrl != null) {
        Router.push(redirectUrl, href, { shallow: true })
      } else if (redirectUrl[0] === '/') {
        Router.push(href)
      } else {
        window.location.href = href
      }
    }

    render() {
      const href = options?.asUrl ?? redirectUrl
      // TODO: Non-js way of fetching query params from current url

      return (
        <>
          <Head>
            {/* Redirects with meta refresh if no JavaScript support */}
            <noscript>
              <meta httpEquiv="refresh" content={`0;url=${href}`} />
            </noscript>
            {(options?.statusCode === undefined ||
              options?.statusCode === 301) && (
              <link rel="canonical" href={href} />
            )}
          </Head>
          {/* Provides a redirect link if no meta refresh support; or children if provided */}
          {this.props.children ? (
            this.props.children
          ) : (
            <p>
              Redirecting to <a href={href}>{href}</a>&hellip;
            </p>
          )}
        </>
      )
    }
  }
