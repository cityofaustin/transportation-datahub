import React from "react";
import Head from "next/head";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Link from "next/link";

const cards = {
  signal_operations: [
    {
      title: "Signal Requests",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: { src: "/assets/data_and_performance.jpg", alt: "DTS logo" },
      key: "signal_requests"
    },
    {
      title: "Signal Monitor",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-monitor",
      img: null,
      key: "signal_monitor"
    },
    {
      title: "Device Status",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/device-status",
      img: null,
      key: "device_status"
    },
    {
      title: "Signal Timing",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-timing",
      img: null,
    },
  ],
  maps_resources: [
    {
      title: "Signal Assets",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: null,
    },
    {
      title: "Signs & Markings",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: null,
    },
    {
      title: "Preventative Maintenance",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: null,
    },
  ],
  open_data: [
    {
      title: "Shared Micromobility",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/micromobility-data",
      img: null,
    },
    {
      title: "Data Catalog",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: null,
    },
    {
      title: "City of Austin Github",
      description:
        "Info about signal requests where you can search and browse info.",
      href: "/signal-requests",
      img: null,
    },
  ],
};

export function CardItem({ href, title, description, img }) {
  return (
    <Link className="text-primary text-decoration-none" href={href}>
    <div style={{cursor: "pointer"}}>
      <Card className="h-100 shadow-sm">
        <Card.Body>
          {img && (
            <Row className="pb-2">
              <Col>
                <Card.Img variant="top" src={img.src} alt={img.alt} />
              </Col>
            </Row>
          )}
          <Card.Title className="text-primary">{title}</Card.Title>

          <Row>
            <Col className="text-muted">{description}</Col>
          </Row>
        </Card.Body>
      </Card>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <>
      <Container>
        <Row>
          <Col md={3}></Col>
          <Col sm={12} md={9} lg={6} className="py-5 px-4 text-primary">
            <Image
              fluid
              src="/assets/data_and_performance.jpg"
              alt="Illustration of a green bicycle"
            />
            <p className="text-muted mt-3">
              This page has useful info, such as dashboards, maps, and misc
              other links to content that you may or may not find interesting.
              Also, we have a data catalog that you can browse. That'd be cool.
            </p>
          </Col>
        </Row>
        <Row className="text-dts-4">
          <Col>
            <h3>Signal Operations</h3>
          </Col>
        </Row>
        <Row className="text-dts-4 mb-4">
          {cards.signal_operations.map((card) => {
            return (
              <Col key={card.key} xs={6} md={3}>
                <CardItem {...card} />
              </Col>
            );
          })}
        </Row>
        <Row className="text-dts-4">
          <Col>
            <h3>Maps & Resources</h3>
          </Col>
        </Row>
        <Row className="text-dts-4 mb-4">
          {cards.maps_resources.map((card) => {
            return (
              <Col key={card.key}  xs={6} md={3}>
                <CardItem {...card} />
              </Col>
            );
          })}
        </Row>
        <Row className="text-dts-4">
          <Col>
            <h3>Open Data & Code</h3>
          </Col>
        </Row>
        <Row className="text-dts-4 mb-4">
          {cards.open_data.map((card) => {
            return (
              <Col key={card.key} xs={6} md={3}>
                <CardItem {...card} />
              </Col>
            );
          })}
        </Row>
      </Container>
      <Footer />
    </>
  );
}
