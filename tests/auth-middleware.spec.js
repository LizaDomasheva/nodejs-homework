const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { authorize } = require('../api/users/users.middleware');
const User = require('../api/users/users.model');
const chai = require('chai');
require('dotenv').config();

describe('Auth middleware test suite', () => {
  context('when no auth header provided', () => {
    let sandbox;

    const req = { headers: {} };
    let res;
    let next;

    before(async () => {
      sandbox = sinon.createSandbox();
      res = { status: sandbox.stub(), json: sandbox.stub() };
      res.status.returns(res);
      next = sandbox.stub();
      sandbox.stub(User, 'findById');

      await authorize(req, res, next);
    });

    after(() => {
      sandbox.restore();
    });

    it('should call res.status once', () => {
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWithExactly(res.status, 401);
    });

    it('should call res.send once', () => {
      sinon.assert.calledOnce(res.json);
    });

    it('should not call User.findById', () => {
      sinon.assert.notCalled(User.findById);
    });

    it('should not call next', () => {
      sinon.assert.notCalled(next);
    });
  });

  context('when jwt token is invalid', () => {
    let sandbox;

    const req = { headers: { authorization: '' } };
    let res;
    let next;

    before(async () => {
      sandbox = sinon.createSandbox();
      res = { status: sandbox.stub(), json: sandbox.stub() };
      res.status.returns(res);
      next = sandbox.stub();
      sandbox.stub(User, 'findById');

      await authorize(req, res, next);
    });

    after(() => {
      sandbox.restore();
    });

    it('should call res.status once', () => {
      sinon.assert.calledOnce(res.status);
      sinon.assert.calledWithExactly(res.status, 401);
    });

    it('should call res.send once', () => {
      sinon.assert.calledOnce(res.json);
    });

    it('should not call User.findById', () => {
      sinon.assert.notCalled(User.findById);
    });

    it('should not call next', () => {
      sinon.assert.notCalled(next);
    });
  });

  context('when everything is ok', () => {
    let sandbox;

    const userId = 'user_id';
    const user = { id: 'user_id_from_db' };
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    let res;
    let next;

    before(async () => {
      sandbox = sinon.createSandbox();
      res = { status: sandbox.stub(), json: sandbox.stub() };
      res.status.returns(res);
      next = sandbox.stub();
      sandbox.stub(User, 'findById').resolves(user);

      await authorize(req, res, next);
    });

    after(() => {
      sandbox.restore();
    });

    it('should not call res.status', () => {
      sinon.assert.notCalled(res.status);
    });

    it('should not call res.send', () => {
      sinon.assert.notCalled(res.json);
    });

    it('should call User.findById once', () => {
      sinon.assert.calledOnce(User.findById);
      sinon.assert.calledWithExactly(User.findById, userId);
    });

    it('should pass user to req object', () => {
      chai.assert.equal(req.user, user);
    });

    it('should call next once', () => {
      sinon.assert.calledOnce(next);
      sinon.assert.calledWithExactly(next);
    });
  });
});
