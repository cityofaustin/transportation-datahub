import React from "react";
import {
  Row,
  Col,
  Button,
  Image,
  Nav,
  Navbar,
  Container,
} from "react-bootstrap";
import Link from "next/link";

const PAGES = [
  { label: "Viewers", route: "/projects" },
  { label: "Data Catalog", route: "/products" },
  { label: "About", route: "/about" },
];

function IconSeparator(props) {
  return (
    <Container fluid>
      <Row>
        <Col className="flex-grow-1 pl-0">
          <hr className="w-100" />
        </Col>
        <Col xs="auto" className="px-xs-0 mx-xs-0">
          <img
            className="float-right"
            height={17}
            src="/assets/icos.jpg"
            alt="Generic placeholder"
          />
        </Col>
        <Col sm={1} className="d-none d-sm-block pr-0">
          <hr className="w-100" />
        </Col>
      </Row>
    </Container>
  );
}

export default function NavComponent(props) {
  const { currentPageRoute, hideSeparator } = props;

  return (
    <>
      <Navbar expand="md" className="py-1">
        <Container fluid key="nav-container">
          <div className="d-flex flex-nowrap">
            <Link href="/">
              <Navbar.Brand style={{cursor: "pointer"}} className="pl-0 me-auto">
                <Image
                  width={300}
                  className="d-none d-md-inline"
                  src="/assets/data_and_performance.jpg"
                  alt="Generic placeholder"
                />
                <Image
                  fluid
                  className="d-inline d-md-none"
                  src="/assets/data_and_performance.jpg"
                  alt="Generic placeholder"
                />
              </Navbar.Brand>
            </Link>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              className="navbar-toggle"
            />
          </div>
          <div>
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav>
                {PAGES.map((page, idx) => {
                  const fontWeightClass =
                    currentPageRoute === page.route ? "font-weight-bold" : "";
                  const borderClass = idx === 0 ? "" : "navbar-menu-borders";
                  return (
                    <div
                      key={page.route}
                      className={`flex-grow-1 mx-0 my-auto ${borderClass}`}
                    >
                      <Nav.Link
                        className={`py-0 text-primary ${fontWeightClass}`}
                        href={page.route}
                      >
                        {page.label}
                      </Nav.Link>
                    </div>
                  );
                })}
              </Nav>
            </Navbar.Collapse>
          </div>
        </Container>
      </Navbar>
      {!hideSeparator && <IconSeparator />}
    </>
  );
}
