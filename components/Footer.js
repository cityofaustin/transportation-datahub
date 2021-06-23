import React from "react";
import { Row, Col, Container } from "react-bootstrap";

export default function Footer() {
  return (
    <Container fluid>
      <Row className="text-primary py-3">
        <hr className="w-100" />
        <Col></Col>
        <Col>
          <strong>Nice content</strong>
          <br />
          hello cool great
        </Col>
        <Col>
          <strong>Nice content</strong>
          <br />
          hello cool great
        </Col>
        <Col>
          <strong>Nice content</strong>
          <br />
          hello cool great
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}
