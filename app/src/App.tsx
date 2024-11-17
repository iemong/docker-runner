import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Button } from "@/components/ui/button";
import { open } from '@tauri-apps/plugin-dialog';
import { Input } from "./components/ui/input";
import { useToast } from "./hooks/use-toast";

function App() {
  const [filePath, setFilePath] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast()

  const selectDir = async () => {
    const filePath = await open({
      multiple: false,
      directory: true,
    });
    setFilePath(filePath ?? "");
  };

  const buildDocker = async () => {
    const result: { success: boolean, message: string } = await invoke("build_docker", { filePath });
    if (result.success) {
      toast({
        title: "ビルドに成功しました",
        description: result.message,
      });
    } else {
      toast({
        title: "ビルドに失敗しました",
        description: result.message,
      });
    }
  };

  const runDocker = async () => {
    const result: { success: boolean, message: string } = await invoke("run_docker", { filePath });
    if (result.success) {
      toast({
        title: "起動に成功しました",
        description: result.message,
      });
      setIsRunning(true);
    } else {
      toast({
        title: "起動に失敗しました",
        description: result.message,
      });
    }
  };

  const stopDocker = async () => {
    const result: { success: boolean, message: string } = await invoke("stop_docker");
    if (result.success) {
      toast({
        title: "停止に成功しました",
        description: result.message,
      });
    } else {
      toast({
        title: "停止に失敗しました",
        description: result.message,
      });
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">furufuru starter</h1>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">ツールのインストール</h2>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <a href="https://desktop.github.com/download/" target="_blank">
              GitHub Desktopをダウンロードする
            </a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="https://docs.docker.com/desktop/setup/install/mac-install/" target="_blank">
              Dockerをダウンロードする
            </a>
          </Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">dockerを起動する</h2>
        <div className="mb-4">
          <Button variant="secondary" onClick={selectDir}>
            ディレクトリを選択する
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Input value={filePath} readOnly className="pointer-events-none" />
        </div>
        <div className="flex gap-2 mb-4">
          <Button variant="default" onClick={buildDocker}>
            dockerをビルドする
          </Button>
          <Button variant="default" onClick={runDocker}>
            dockerを起動する
          </Button>
          <Button variant="secondary" onClick={stopDocker}>
            dockerを停止する
          </Button>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-bold mb-4">ローカルサーバーにアクセスする</h2>
        <Button variant="default" asChild disabled={!isRunning}>
          <a href="http://localhost:3000" target="_blank">ローカルサーバーにアクセスする</a>
        </Button>
      </section>
    </main>
  );
}

export default App;
