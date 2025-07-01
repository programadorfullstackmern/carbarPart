import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Envelope, Telephone } from 'react-bootstrap-icons'

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-3">
      <Container>
        <Row className="justify-content-between">
          <Col lg={5} className="mb-4 mb-lg-0">
            <h5>CarBar & Parts</h5>
            <p>
              Venta de autos y piezas originales con la mejor calidad y servicio.
            </p>
          </Col>
          
          <Col lg={6}>
            <Row>
              <Col md={6} className="mb-4 mb-md-0">
                <h5>Contacto</h5>
                <ul className="list-unstyled">
                  <li className="mb-2 d-flex align-items-center">
                    <Envelope className="me-2" /> 
                    <a href="mailto:carbarparts@gmail.com" className="text-light text-decoration-none">
                      carbarparts@gmail.com
                    </a>
                  </li>
                  <li className="d-flex align-items-center">
                    <Telephone className="me-2" /> (+1 234 567 890)
                  </li>
                  <li className="d-flex align-items-center mt-2">
                    <Telephone className="me-2" /> (+1 234 567 890)
                  </li>
                </ul>
              </Col>
              
              <Col md={6}>
                <h5>Síguenos</h5>
                <div className="d-flex mt-3">
                  <a href="#" className="me-3 text-light" aria-label="Facebook">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="me-3 text-light" aria-label="Twitter">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="me-3 text-light" aria-label="Instagram">
                    <Instagram size={20} />
                  </a>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        
        <hr className="my-4 bg-secondary" />
        
        <Row>
          <Col className="text-center">
            <small>&copy; {new Date().getFullYear()} CarBar & Parts. Todos los derechos reservados.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer