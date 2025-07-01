import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content py-4">
        <Container>
          <Outlet />
        </Container>
      </main>
      <Footer />
    </>
  )
}

export default Layout