import cors from 'cors';
import express, { Application } from 'express'
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

let users: Object[] = [];
let tokens: Object[] = [];
let articles: Object[] = [];;
class Server {
    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '8000';

        // CORS
        this.app.use(cors());

        // Lectura del body
        this.app.use(express.json());

        // Create User
        this.app.post('/api/user', (req: Request, res: Response) => {
            const body = req.body;
            if (!body || Object.keys(body).length === 0) {
                res.status(400).json({
                    msg: `Usuario inválido`
                });
            }

            const user = {
                user_id: body.user_id,
                login: body.login,
                password: body.password
            }
            users.push(user);

            res.status(200).json({
                user
            });
        });

        // Authenticate
        this.app.post('/api/user/authenticate', (req: Request, res: Response) => {
            const body = req.body;
            if (!body || Object.keys(body).length === 0) {
                res.status(400).json({
                    msg: `Usuario inválido`
                });
            }

            const posLogin = users.findIndex(u => u["login"] === body.login)

            if (posLogin < 0) {
                res.status(404).json({
                    msg: `No existe usuario ${body.login}`
                });
            }

            const posPassword = users.findIndex(u => u["password"] === body.password);

            if (posPassword < 0) {
                res.status(404).json({
                    msg: `Password Incorrecto`
                });
            }

            const token = uuidv4();
            tokens.push(token);

            res.status(200).json({
                token
            });
        });

        // Logout
        this.app.post('/api/user/logout', (req: Request, res: Response) => {
            const token2 = req.headers['authentication-header'];


            const posToken = tokens.findIndex(u => u === token2)

            if (posToken < 0) {
                res.status(404).json({
                    msg: `Token inválido`
                });
            }

            tokens.splice(posToken, 1);

            res.status(200).json({
                success: true
            });
        });

        // Create Article
        this.app.post('/api/article', (req: Request, res: Response) => {
            const body = req.body;
            const token = req.headers['authentication-header'];

            if (!body || Object.keys(body).length === 0) {
                res.status(400).json({
                    msg: `Articulo inválido`
                });
            }

            const posToken = tokens.findIndex(u => u === token)

            if (posToken < 0) {
                res.status(404).json({
                    msg: `Token inválido`
                });
            }

            const article = {
                article_id: body.article_id,
                title: body.title,
                content: body.content,
                visibility: body.visibility,
                user_id: body.user_id
            }
            articles.push(article);

            res.status(200).json({
                article
            });
        });

        // Get Articles
        this.app.get('/api/articles', (req: Request, res: Response) => {
            // const body = req.body;
            const token = req.headers['authentication-header'];

            // if (!body || Object.keys(body).length === 0) {
            //     res.status(400).json({
            //         msg: `Articulo inválido`
            //     });
            // }

            const publicArticles = articles.filter(a => a["visibility"] === 'public');
            const privateArticles = articles.filter(a => a["visibility"] === 'private');
            const loggedInArticles = articles.filter(a => a["visibility"] === 'logged_in');

            const posToken = tokens.findIndex(u => u === token)

            if (posToken >= 0) {
                res.status(200).json({
                    publicArticles,
                    privateArticles,
                    loggedInArticles
                });
            }

            if (posToken < 0) {
                res.status(200).json({
                    publicArticles
                });
            }

        });
    }
    
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }
}

export default Server;