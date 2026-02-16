{
  pkgs, ...
}: {
  channel = "stable-23.11";
  pre-start = ''
    echo "Dev Environment Ready"
  '';
}