const { test, expect, beforeEach, describe } = require('@playwright/test')
const { exit } = require('process')
const blog = require('../backend/models/blog')

describe('Blog App', () => {
    beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        const loginHeader = page.getByRole('heading', { name: 'Log in to application' });
        const loginForm = page.locator('form[name="login form"]');
        const usernameInput = page.getByPlaceholder('username');
        const passwordInput = page.getByPlaceholder('password');
        const loginButton = page.getByRole('button', { name: 'login' });

        await expect(loginHeader).toBeVisible();
        await expect(loginForm).toBeVisible();
        await expect(usernameInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(loginButton).toBeVisible();
        })
    
    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await page.fill('input[name="Username"]', 'root');
            await page.fill('input[name="Password"]', 'salainen');
            await page.click('button[type="submit"]');

            const response = await page.waitForResponse(response => 
                response.url().includes('/api/login') && response.status() === 200
            );
        })

        test('fails with wrong credentials', async ({ page }) => {
            await page.fill('input[name="Username"]', 'wrong');
            await page.fill('input[name="Password"]', 'credentials');
            await page.click('button[type="submit"]');

            const errorMessage = await page.getByText('invalid username or password');
            await expect(errorMessage).toBeVisible();
        })
    })

    describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            await page.fill('input[name="Username"]', 'root');
            await page.fill('input[name="Password"]', 'salainen');
            await page.click('button[type="submit"]');
            await page.waitForResponse(response => 
                response.url().includes('/api/login') && response.status() === 200
            );
            await page.waitForSelector('text=Blogs');
        })
        test('A blog can be created', async ({ page }) => {
            const newBlogName = `Test Blog Title ${Date.now()}`;
            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName);
            await page.fill('input[name="author"]', 'Test Author');
            await page.fill('input[name="url"]', 'http://test.com');
            await page.click('button:has-text("create")');
            
            await page.waitForTimeout(1000); // Wait for the blog to be created and rendered

            const blogElement = page.getByText(`${newBlogName} Test Author`);
            await expect(blogElement.first()).toBeVisible();
        })
        test('A blog can be liked', async ({ page }) => {
            const newBlogName = 'Test Blog Title ' + Date.now();

            await page.waitForTimeout(1000);
            
            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName);
            await page.fill('input[name="author"]', 'Test Author');
            await page.fill('input[name="url"]', 'http://test.com');
            await page.click('button:has-text("create")');


            const blogContainer = page.locator('.blog:has-text("' + newBlogName + '")');
            await page.waitForTimeout(6000);

            await blogContainer.getByRole('button', { name: 'view' }).click({ timeout: 10000 });
            await blogContainer.getByRole('button', { name: 'like' }).click({ timeout: 10000 });
            const likesText = blogContainer.getByText(/1 likes/);
            await expect(likesText).toBeVisible();
        })

        test('A blog can be deleted by the user who created it', async ({ page }) => {
            const newBlogName = 'Test Delete Blog ' + Date.now();
            await page.waitForTimeout(1000);

            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName);
            await page.fill('input[name="author"]', 'Test Author');
            await page.fill('input[name="url"]', 'http://testdelete.com');
            await page.click('button:has-text("create")');
            
            await page.waitForTimeout(6000);

            const blogContainer = page.locator('.blog:has-text("' + newBlogName + '")');
            await page.waitForTimeout(1000);
            await blogContainer.getByRole('button', { name: 'view' }).click({ timeout: 10000 });

            page.on('dialog', async (dialog) => {
                expect(dialog.type()).toBe('confirm');
                expect(dialog.message()).toContain(`Remove blog ${newBlogName} by Test Author?`);
                await dialog.accept();
            });

            await blogContainer.getByRole('button', { name: 'remove' }).click({ timeout: 10000 });

            console.log(blogContainer);
            await expect(page.getByText(`${newBlogName} Test Author`)).not.toBeVisible();
        })

        test('remove button is not shown for blogs created by other users', async ({ page }) => {
            const newBlogName = 'Test Blog Not Removable ' + Date.now();
            await page.waitForTimeout(1000);
            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName);
            await page.fill('input[name="author"]', 'Test Author');
            await page.fill('input[name="url"]', 'http://testnotremovable.com');
            await page.click('button:has-text("create")');

            await page.waitForTimeout(1000);
            await page.click('button:has-text("logout")');
            await page.fill('input[name="Username"]', 'hesam');
            await page.fill('input[name="Password"]', '123');
            await page.click('button[type="submit"]');
            await page.waitForResponse(response => 
                response.url().includes('/api/login') && response.status() === 200
            );
            await page.waitForSelector('text=Blogs');

            await page.waitForTimeout(6000);

            const blogContainer = page.locator('.blog:has-text("' + newBlogName + '")');
            await page.waitForTimeout(1000);
            await blogContainer.getByRole('button', { name: 'view' }).click({ timeout: 10000 });

            const removeButton = blogContainer.getByRole('button', { name: 'remove' });
            await expect(removeButton).toBeHidden();
        })

        test('blogs are ordered by likes', async ({ page }) => {
            await fetch('http://localhost:3000/api/blogs/deleteMany', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const newBlogName1 = 'Test Blog 1 ' + Date.now();
            const newBlogName2 = 'Test Blog 2 ' + Date.now();

            await page.waitForTimeout(6000);

            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName1);
            await page.fill('input[name="author"]', 'Test Author 1');
            await page.fill('input[name="url"]', 'http://test1.com');
            await page.click('button:has-text("create")');

            await page.waitForTimeout(6000);

            await page.click('button:has-text("new blog")');
            await page.fill('input[name="title"]', newBlogName2);
            await page.fill('input[name="author"]', 'Test Author 2');
            await page.fill('input[name="url"]', 'http://test2.com');
            await page.click('button:has-text("create")');

            const blogContainer1 = page.locator('.blog:has-text("' + newBlogName1 + '")');
            const blogContainer2 = page.locator('.blog:has-text("' + newBlogName2 + '")');

            await blogContainer1.getByRole('button', { name: 'view' }).click();
            await blogContainer1.getByRole('button', { name: 'like' }).click();

            await blogContainer2.getByRole('button', { name: 'view' }).click();
            await blogContainer2.getByRole('button', { name: 'like' }).click();
            await blogContainer2.getByRole('button', { name: 'like' }).click();

            const moreLikedblog = page.locator('.blog:has-text("' + newBlogName2 + '")');
            await expect(moreLikedblog).toBeVisible();
            await expect(moreLikedblog).toContainText(newBlogName2);
            // expect(blogs[2]).toContainText(newBlogName1);
        })
    })


})