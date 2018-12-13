import { loadSeeds } from '../seeding/loadSeeds';

before(done => {
    loadSeeds()
        .then(() => done())
        .catch(err => done(err));
});

after(done => {
    done();
    process.exit();
});
