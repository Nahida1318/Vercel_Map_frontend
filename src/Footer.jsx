function Footer() {
  return (
    <footer>
      <p>Made with &hearts;</p>
      <p>&copy; {new Date().getFullYear()}-SAFE Roads</p>
      <nav>
        <a href="#">Privacy Policy</a> |<a href="#">Terms of Service</a>
      </nav>
    </footer>
  );
}

export default Footer;
